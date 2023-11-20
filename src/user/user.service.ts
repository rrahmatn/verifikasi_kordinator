import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as argon from 'argon2';
import { AddUserDto, Signin } from './dto/index.dto';
@Injectable()
export class UserService {
  private readonly prisma = new PrismaClient();

  async addUser(dto: AddUserDto) {
    if (dto.password !== dto.confPassword) {
      throw new BadRequestException(
        'password dan confirm password tidak cocok',
      );
    }

    const user = await this.prisma.users.findFirst({
      where: {
        email: dto.email,
      },
    });

    if (user) {
      throw new BadRequestException('email sudah digunakan');
    }

    const hash = await argon.hash(dto.password);

    delete dto.password;
    delete dto.confPassword;

    try {
      const newUser = await this.prisma.users.create({
        data: {
          password: hash,
          ...dto,
        },
      });

      return {
        message: 'berhasil menambahkan user',
        user: newUser,
      };
    } catch (error) {
      throw new BadGatewayException(
        'server sedang sibuk tolong lakukan sekali lagi',
      );
    }
  }

  async signin(dto: Signin) {
    const user = await this.prisma.users.findFirst({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new NotFoundException('email tidak terdaftar');
    }

    const matches = await argon.verify(user.password, dto.password);

    if (!matches) {
      throw new BadRequestException('password salah');
    }

    delete user.password;

    return {
      message: 'login berhasil',
      status: 200,
      user,
    };
  }

  async getUser(id: number) {
    const user = await this.prisma.users.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException('user tidak ditemukan');
    }

    return {
      message: 'berhasil mendapatkan data user.nama',
      user,
    };
  }

  
  
}
