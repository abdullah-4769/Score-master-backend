import { Controller, Get, Query, Post, Body, BadRequestException } from '@nestjs/common'
import { AgoraService } from './agora.service'

@Controller('agora')
export class AgoraController {
  constructor(private readonly agoraService: AgoraService) {}

  @Get('token')
  async getAgoraToken(@Query('channelName') channelName: string, @Query('uid') uid: string, @Query('role') role: 'host' | 'audience' = 'audience') {
    if (!channelName || !uid) throw new BadRequestException('channelName and uid are required')
    const tokenData = await this.agoraService.generateToken(channelName, Number(uid), role)
    return { success: true, data: tokenData }
  }

  @Post('session/start')
  async startAgoraSession(@Body() body: { channelName: string; hostUid: number; durationInHours: number; scheduledAt?: string }) {
    const { channelName, hostUid, durationInHours, scheduledAt } = body
    if (!channelName || !hostUid || !durationInHours) throw new BadRequestException('channelName, hostUid, and durationInHours are required')
    const session = await this.agoraService.startSession(channelName, hostUid, durationInHours, scheduledAt ? new Date(scheduledAt) : undefined)
    return { success: true, session }
  }

  @Get('sessions')
  async getAllSessions() {
    const sessions = await this.agoraService.getAllSessions()
    return { success: true, sessions }
  }

  @Get('host/sessions')
  async getHostSessions(@Query('hostUid') hostUid: number) {
    if (!hostUid) throw new BadRequestException('hostUid is required')
    const sessions = await this.agoraService.getHostSessions(Number(hostUid))
    return { success: true, sessions }
  }
}
