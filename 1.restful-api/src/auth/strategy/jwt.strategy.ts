import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { RsaKeyService } from 'src/util/rsa.service';
import { AuthService } from '../auth.service';
import { Injectable } from '@nestjs/common';
import { JwtPayloadDto, JwtUserDataDto } from '../dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt-strategy') {
  constructor(
    private readonly rsaKeyService: RsaKeyService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: rsaKeyService.getPublicKey(),
    });
  }

  async validate(payload: JwtPayloadDto): Promise<JwtUserDataDto> {
    return this.authService.validatePayload(payload);
  }
}
