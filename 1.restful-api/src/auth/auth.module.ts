import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UtilModule } from 'src/util/util.module';
import { JwtModule } from '@nestjs/jwt';
import { RsaKeyService } from 'src/util/rsa.service';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtAuthGuard } from './guard/jwt.guard';

@Module({
  imports: [
    UtilModule,
    JwtModule.registerAsync({
      imports: [UtilModule],
      inject: [RsaKeyService],
      useFactory: async (rsaKeyService: RsaKeyService) => ({
        privateKey: rsaKeyService.getPrivateKey(),
        publicKey: rsaKeyService.getPublicKey(),
        signOptions: { algorithm: 'RS256', expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
})
export class AuthModule {}
