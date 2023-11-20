import { Module } from '@nestjs/common';
import { DataModule } from './data/data.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';

@Module({
  imports:[ ConfigModule.forRoot({
    isGlobal: true,
  }),DataModule, UserModule],
})
export class AppModule {}
