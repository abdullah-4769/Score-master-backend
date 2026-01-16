import { Injectable, InternalServerErrorException, ForbiddenException } from '@nestjs/common'
import { RtcRole, RtcTokenBuilder } from 'agora-access-token'
import { PrismaService } from '../lib/prisma/prisma.service'
import { AgoraRole, AgoraTokenResponse } from './agora.types'

@Injectable()
export class AgoraService {
  constructor(private prisma: PrismaService) { }

async generateToken(channelName: string, uid: number, role: AgoraRole = 'audience'): Promise<AgoraTokenResponse> {
  const appID = process.env.AGORA_APP_ID
  const appCertificate = process.env.AGORA_APP_CERTIFICATE
  if (!appID || !appCertificate) throw new InternalServerErrorException('Agora App ID or Certificate not set')

  const session = await this.prisma.agoraSession.findUnique({ where: { channelName } })
  if (!session) throw new ForbiddenException('Session does not exist')

  // If host joins before scheduled time, activate session immediately
  if (role === 'host' && !session.isActive) {
    await this.prisma.agoraSession.update({
      where: { channelName },
      data: { isActive: true, startTime: new Date() }
    })
    session.isActive = true
    session.startTime = new Date()
  }

  if (!session.isActive && role === 'audience') throw new ForbiddenException('Host has not started the session yet')

  const start = session.startTime
  if (!start) throw new ForbiddenException('Session has not started yet')

  const endTime = new Date(start)
  endTime.setHours(endTime.getHours() + (session.durationInHours || 0))
  if (new Date() > endTime) throw new ForbiddenException('Session has ended')

  const expirationTimeInSeconds = 36000
  const agoraRole = role === 'host' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER
  const token = RtcTokenBuilder.buildTokenWithUid(
    appID,
    appCertificate,
    channelName,
    uid,
    agoraRole,
    Math.floor(Date.now() / 1000) + expirationTimeInSeconds
  )

  return { token, channelName, uid, expiresIn: expirationTimeInSeconds, role }
}


  async startSession(channelName: string, hostUid: number, durationInHours: number, scheduledAt?: Date) {
    const now = new Date()
    const startTime = scheduledAt && scheduledAt > now ? scheduledAt : now
    const session = await this.prisma.agoraSession.upsert({
      where: { channelName },
      update: { startTime, durationInHours, scheduledAt, isActive: scheduledAt && scheduledAt > now ? false : true },
      create: { channelName, hostUid, startTime, durationInHours, scheduledAt, isActive: scheduledAt && scheduledAt > now ? false : true }
    })
    return session
  }

  async activateScheduledSessions() {
    const now = new Date()
    await this.prisma.agoraSession.updateMany({
      where: { scheduledAt: { lte: now }, isActive: false },
      data: { isActive: true, startTime: now }
    })
  }

  async getAllSessions() {
    return this.prisma.agoraSession.findMany({ orderBy: { scheduledAt: 'asc' } })
  }

  async getHostSessions(hostUid: number) {
    return this.prisma.agoraSession.findMany({ where: { hostUid }, orderBy: { createdAt: 'desc' } })
  }
}
