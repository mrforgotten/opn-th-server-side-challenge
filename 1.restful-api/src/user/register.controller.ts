import {
  BadRequestException,
  Body,
  Controller,
  InternalServerErrorException,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterFormDto } from './dto';
import {
  DUPLICATE_EMAIL,
  PASSWORD_NOT_STRONG,
} from 'src/data-store/constant/store-error-message';

@UsePipes(ValidationPipe)
@Controller()
export class RegisterController {
  constructor(private readonly userService: UserService) {}

  errorHandling(e: Error) {
    switch (e.message) {
      case DUPLICATE_EMAIL:
      case PASSWORD_NOT_STRONG:
        throw new BadRequestException(e.message);
      default:
        throw new InternalServerErrorException(e.message);
    }
  }

  @Post('/register')
  async register(@Body() registrationData: RegisterFormDto) {
    try {
      const created = await this.userService.register(registrationData);
      return created;
    } catch (e) {
      throw e;
    }
  }
}
