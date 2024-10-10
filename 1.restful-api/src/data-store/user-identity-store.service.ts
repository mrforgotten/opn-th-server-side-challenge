import { Injectable } from '@nestjs/common';

import { Mutex } from 'async-mutex';
import { UserIdentity } from './entitiy/user-identity.entity';
import { UserIdentityStoreCreateDto, UserIdentityStoreUpdateDto } from './dto';
import { DUPLICATE_ID, NOT_FOUND } from './constant/store-error-message';

@Injectable()
export class UserIdentityStoreService {
  private userIdMap: { [userId: number]: UserIdentity };
  private mutex: Mutex;
  constructor() {
    this.userIdMap = {};
    this.mutex = new Mutex();
  }

  async create(input: UserIdentityStoreCreateDto): Promise<UserIdentity> {
    const release = await this.mutex.acquire();
    try {
      if (this.userIdMap[input.userId] !== undefined) {
        throw new Error(DUPLICATE_ID);
      }
      this.userIdMap[input.userId] = input;
      return this.userIdMap[input.userId];
    } finally {
      release();
    }
  }

  async update(
    userId: number,
    input: UserIdentityStoreUpdateDto,
  ): Promise<UserIdentity> {
    const release = await this.mutex.acquire();
    try {
      if (!this.userIdMap[userId]) {
        throw new Error(NOT_FOUND);
      }
      for (const key in input) {
        this.userIdMap[userId][key] = input[key];
      }
      return this.userIdMap[userId];
    } finally {
      release();
    }
  }

  async delete(userId: number) {
    const release = await this.mutex.acquire();
    try {
      if (!this.userIdMap[userId]) {
        throw new Error(NOT_FOUND);
      }
      console.log('deleting identity');
      delete this.userIdMap[userId];
      return true;
    } finally {
      release();
    }
  }

  async findByUserId(userId: number) {
    const release = await this.mutex.acquire();
    try {
      if (!this.userIdMap[userId]) {
        throw new Error(NOT_FOUND);
      }
      return this.userIdMap[userId];
    } finally {
      release();
    }
  }
}
