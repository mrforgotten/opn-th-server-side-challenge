import { Injectable } from '@nestjs/common';
import { isStrongPassword } from 'class-validator';
import { UserStoreService } from 'src/data-store/user-store.service';
import { UserIdentityStoreService } from 'src/data-store/user-identity-store.service';
import { User } from 'src/data-store/entitiy/user.entity';
import {
  hashPassword,
  isMatchPassword,
  isStrongPasswordOptions,
} from 'src/util/password';
import {
  BLANK_UPDATE,
  NEW_AND_CONFIRM_PASSWORD_NOT_MATCH,
  PASSWORD_MISMATCH,
  PASSWORD_NOT_STRONG,
} from '../data-store/constant/store-error-message';
import { RegisterFormDto, UserUpdateDto, UserUpdatePasswordDto } from './dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userStore: UserStoreService,
    private readonly userIdentityStore: UserIdentityStoreService,
  ) {}
  async register(input: RegisterFormDto): Promise<User> {
    const { password, ...userInput } = input;
    if (!isStrongPassword(password, isStrongPasswordOptions)) {
      throw new Error(PASSWORD_NOT_STRONG);
    }

    const created = await this.userStore.create(userInput);
    await this.userIdentityStore.create({
      userId: created.id,
      password: hashPassword(password),
    });
    return created;
  }

  async update(id: number, input: UserUpdateDto) {
    if (Object.keys(input).length === 0) {
      throw new Error(BLANK_UPDATE);
    }

    const updated = await this.userStore.update(id, input);

    return updated;
  }

  async updatePassword(
    id: number,
    input: UserUpdatePasswordDto,
  ): Promise<boolean> {
    const { currentPassword, newPassword, confirmNewPassword } = input;
    const prevUserIdentity = await this.userIdentityStore.findByUserId(id);
    if (!isMatchPassword(currentPassword, prevUserIdentity.password)) {
      throw new Error(PASSWORD_MISMATCH);
    }

    if (!isStrongPassword(newPassword, isStrongPasswordOptions)) {
      throw new Error(PASSWORD_NOT_STRONG);
    }
    if (newPassword !== confirmNewPassword) {
      throw new Error(NEW_AND_CONFIRM_PASSWORD_NOT_MATCH);
    }

    const updated = await this.userIdentityStore.update(id, {
      password: hashPassword(currentPassword),
    });

    return updated ? true : false;
  }

  async findById(id: number): Promise<User> {
    return await this.userStore.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const deleted = await this.userStore.delete(id);
    try {
      await this.userIdentityStore.delete(id);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      throw e;
    }

    return deleted;
  }
}
