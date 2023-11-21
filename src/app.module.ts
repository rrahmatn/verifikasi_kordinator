import { Module } from '@nestjs/common';
import { DataModule } from './data/data.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports:[ ConfigModule.forRoot({
    isGlobal: true,
  }),DataModule, UserModule , PrismaModule],
})
export class AppModule {}
