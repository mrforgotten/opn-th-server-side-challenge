import { Global, Module } from '@nestjs/common';
import { UserIdentityStoreService } from './user-identity-store.service';
import { UserStoreService } from './user-store.service';

@Global()
@Module({
  providers: [UserIdentityStoreService, UserStoreService],
  exports: [UserIdentityStoreService, UserStoreService],
})
export class DataStoreModule {}
