import { Controller, Get,Delete, Param,Patch ,Body} from '@nestjs/common'
import { UserService } from './user.service'

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.userService.getUserById(Number(id))
  }

  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() data: any
  ) {
    return this.userService.updateUser(Number(id), data)
  }

  @Patch(':id/toggle-suspend')
  async toggleSuspend(@Param('id') id: string) {
    return this.userService.toggleSuspend(Number(id))
  }

  @Get(':id/stats')
  async getUserStats(@Param('id') id: string) {
    return this.userService.getUserStats(Number(id))
  }

  @Get(':id/facilitator-stats')
  async getFacilitatorStats(@Param('id') id: string) {
    return this.userService.getFacilitatorStats(Number(id))
  }
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(Number(id))
  }

}
