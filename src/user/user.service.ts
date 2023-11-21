import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as argon from 'argon2';
import { AddUserDto, EditUser, Signin } from './dto/index.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Token } from './type';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async addUser(dto: AddUserDto) {
    if (dto.password !== dto.confPassword) {
      throw new BadRequestException(
        'password dan confirm password tidak cocok',
      );
    }

    const user = await this.prisma.users.findFirst({
      where: {
        username: dto.username,
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
    try {
      const user = await this.prisma.users.findFirst({
        where: {
          username: dto.username,
        },
      });

      if (!user) {
        return {
          status: 400,
          message: `username atau password salah`,
        };
      }

      const matches = await argon.verify(user.password, dto.password);

      if (!matches) {
        return {
          status: 400,
          message: `username atau password salah`,
        };
      }

      delete user.password;

      return this.signToken(user.id, user.nama);
    } catch (error) {
      throw new BadRequestException('server error ya');
    }
  }

  async signToken(userId: number, name: string): Promise<Token> {
    const payload = {
      name,
      sub: userId,
    };
    const atsecret = this.config.get('JWT_SECRET');

    const [at] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: atsecret,
        expiresIn: '12h',
      }),
    ]);

    return {
      nama: name,
      status: 200,
      access_token: at,
    };
  }

  async newToken(userId: number, name: string): Promise<Token> {
    const payload = {
      sub: userId,
      name,
    };

    const atsecret = this.config.get('JWT_SECRET');

    const at = await this.jwt.signAsync(payload, {
      secret: atsecret,
      expiresIn: '12h ',
    });

    return {
      nama: name,
      status: 200,
      access_token: at,
    };
  }

  async firstLogin(req: any, dto: EditUser) {
    if (dto.password !== dto.confPassword) {
      throw new BadRequestException(
        'password dan konfirmasi password tidak cocok',
      );
    }

    const token = req.headers.authorization?.split(' ') ?? [];
    const accessToken = token[1];

    const payload = await this.jwt.verifyAsync(accessToken, {
      secret: this.config.get('JWT_SECRET'),
    });
    const id = payload.sub;

    const password = await argon.hash(dto.password);
    delete dto.password;
    delete dto.confPassword;

    try {
      const response = await this.prisma.users.update({
        where: {
          id,
        },
        data: {
          password,
          ...dto,
        },
      });

      delete response.password;

      return {
        message: `berhasil mengubah data ${response.username}`,
        response,
      };
    } catch (err) {
      throw new BadGatewayException('server sedang sibuk');
    }
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
