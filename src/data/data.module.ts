import { Module } from '@nestjs/common';
import { DataController } from './data.controller';
import { DataService } from './data.service';
import { JwtStrategy } from 'src/user/strategy/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule.register({})],
  controllers: [DataController],
  providers: [DataService , JwtStrategy]
})
export class DataModule {}
