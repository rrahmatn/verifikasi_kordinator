import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { AddUserDto, EditUser, Signin } from './dto/index.dto';
import { JwtGuard } from './guard/jwt.guard';

@ApiTags('user')
@Controller('user')
@ApiBearerAuth()
export class UserController {
  constructor(private UserService: UserService) {}

  @Post('signin')
  async signin(@Body() dto: Signin) {
    return this.UserService.signin(dto);
  }

  @UseGuards(JwtGuard)
  @Post('/uinsgd/if20')
  async addUser(@Body() dto: AddUserDto) {
    return this.UserService.addUser(dto);
  }

  @UseGuards(JwtGuard)
  @Patch('')
  async firstEdit(@Request() req: any, @Body() dto: EditUser) {
    return this.UserService.firstLogin(req, dto);
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.UserService.getUser(parseInt(id));
  }
}
