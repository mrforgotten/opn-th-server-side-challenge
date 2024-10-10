import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserIdentityStoreService } from 'src/data-store/user-identity-store.service';
import { UserStoreService } from 'src/data-store/user-store.service';
import { LoginDto } from './dto/login.dto';
import { isMatchPassword } from 'src/util/password';
import {
  NOT_FOUND,
  PASSWORD_MISMATCH,
} from 'src/data-store/constant/store-error-message';
import { JwtService } from '@nestjs/jwt';
import { isEmpty } from 'class-validator';
import { JwtPayloadDto, JwtUserDataDto } from './dto/jwt-payload.dto';
import {
  INVALID_TOKEN,
  UNABLE_TO_REVOKE_TOKEN,
} from './constant/auth-error-message';
import { UserIdentity } from 'src/data-store/entitiy/user-identity.entity';
type signedJwtToken = string;
@Injectable()
export class AuthService {
  constructor(
    private readonly userStore: UserStoreService,
    private readonly userIdentityStore: UserIdentityStoreService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginInput: LoginDto): Promise<signedJwtToken> {
    const user = await this.userStore.findByEmail(loginInput.email);
    const userIdentity = await this.userIdentityStore.findByUserId(user.id);
    if (!isMatchPassword(loginInput.password, userIdentity.password)) {
      throw new Error(PASSWORD_MISMATCH);
    }
    if (isEmpty(userIdentity.jwtModifier)) {
      const newJwtModifier = crypto.randomUUID().slice(0, 10);
      await this.userIdentityStore.update(user.id, {
        jwtModifier: newJwtModifier,
      });
      userIdentity.jwtModifier = newJwtModifier;
    }
    return this.signToken({
      sub: user.id,
      jwtModifier: userIdentity.jwtModifier,
    });
  }

  signToken(payload): signedJwtToken {
    const signedToken = this.jwtService.sign(payload);
    return signedToken;
  }

  async validateToken(token: string) {
    const payload: JwtPayloadDto = this.jwtService.verify(token);
    return this.validatePayload(payload);
  }

  async validatePayload(payload: JwtPayloadDto): Promise<JwtUserDataDto> {
    let userIdentity: UserIdentity;
    try {
      userIdentity = await this.userIdentityStore.findByUserId(payload.sub);
    } catch (e) {
      if (e.message === NOT_FOUND) {
        throw new UnauthorizedException(INVALID_TOKEN);
      }
      throw e;
    }
    if (
      !userIdentity.jwtModifier ||
      payload.jwtModifier !== userIdentity.jwtModifier
    ) {
      throw new UnauthorizedException(INVALID_TOKEN);
    }
    const userData = await this.userStore.findById(userIdentity.userId);

    return { id: userData.id, email: userData.email, name: userData.name };
  }

  async revokeToken(userId: number): Promise<boolean> {
    const updated = await this.userIdentityStore.update(userId, {
      jwtModifier: null,
    });

    if (!isEmpty(updated.jwtModifier)) {
      throw new Error(UNABLE_TO_REVOKE_TOKEN);
    }

    return true;
  }
}
