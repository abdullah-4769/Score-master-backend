import { Controller, Get, Param,Patch ,Body} from '@nestjs/common'
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



  @Get(':id/stats')
  async getUserStats(@Param('id') id: string) {
    return this.userService.getUserStats(Number(id))
  }

  @Get(':id/facilitator-stats')
  async getFacilitatorStats(@Param('id') id: string) {
    return this.userService.getFacilitatorStats(Number(id))
  }


}
