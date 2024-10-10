import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { RegisterController } from './register.controller';

@Module({
  controllers: [UserController, RegisterController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
