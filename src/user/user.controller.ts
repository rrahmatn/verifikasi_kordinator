import { BadRequestException, Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { AddUserDto, Signin } from './dto/index.dto';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private UserService: UserService) {}


  @Post()
  async addUser(@Body() dto: AddUserDto){
    return this.UserService.addUser(dto)
  }


  @Post('signin')
  async signin(@Body() dto: Signin){
    return this.UserService.signin(dto)
  }


  @Get(':id')
  async getUser(@Param('id') id : string){
    return this.UserService.getUser(parseInt(id))
  }
}
