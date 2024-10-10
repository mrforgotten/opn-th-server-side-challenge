import { Module } from '@nestjs/common';
import { RsaKeyService } from './rsa.service';

@Module({
  providers: [RsaKeyService],
  exports: [RsaKeyService],
})
export class UtilModule {}
