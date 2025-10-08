import { Controller, Get, Param } from '@nestjs/common'
import { UserService } from './user.service'

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get(':id/stats')
  async getUserStats(@Param('id') id: string) {
    return this.userService.getUserStats(Number(id))
  }

  @Get(':id/facilitator-stats')
  async getFacilitatorStats(@Param('id') id: string) {
    return this.userService.getFacilitatorStats(Number(id))
  }


}
