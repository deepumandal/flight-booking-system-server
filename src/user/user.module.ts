import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtAuthService } from 'src/jwt-auth/jwt-auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Module({
  imports : [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService, JwtAuthService],
})
export class UserModule {}
