export type AgoraRole = 'host' | 'audience'

export interface AgoraTokenResponse {
  token: string
  channelName: string
  uid: number | string
  expiresIn: number
  role: AgoraRole
}
