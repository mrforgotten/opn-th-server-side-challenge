import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  InternalServerErrorException,
  Post,
  UnauthorizedException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import {
  NOT_FOUND,
  PASSWORD_MISMATCH,
} from 'src/data-store/constant/store-error-message';
import {
  MALFORMED_TOKEN,
  UNABLE_TO_REVOKE_TOKEN,
  UNAUTHORIZED,
} from './constant/auth-error-message';
import { JwtAuthGuard } from './guard/jwt.guard';
import { User } from './decorator/user.decorator';
import { JwtUserDataDto } from './dto';

@UsePipes(ValidationPipe)
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginInput: LoginDto) {
    try {
      const token = await this.authService.login(loginInput);
      return token;
    } catch (e) {
      switch (e.message) {
        case NOT_FOUND:
        case PASSWORD_MISMATCH:
          throw new UnauthorizedException(UNAUTHORIZED);
        default:
          throw new InternalServerErrorException(e.message);
      }
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('validate')
  async validate(@Headers('Authorization') authToken: string) {
    const slicedBearer = authToken.split(' ');
    if (slicedBearer.length !== 2 || slicedBearer[0] !== 'Bearer') {
      throw new BadRequestException(MALFORMED_TOKEN);
    }

    const userData = await this.authService.validateToken(slicedBearer[1]);

    return userData;
  }

  @UseGuards(JwtAuthGuard)
  @Post('revoke-token')
  async revokeToken(@User() user: JwtUserDataDto) {
    try {
      return await this.authService.revokeToken(user.id);
    } catch (e) {
      switch (e.message) {
        case NOT_FOUND:
          throw new UnauthorizedException(UNAUTHORIZED);
        case UNABLE_TO_REVOKE_TOKEN:
        default:
          throw new InternalServerErrorException(e.message);
      }
    }
  }
}
