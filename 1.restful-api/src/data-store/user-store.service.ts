import { Injectable } from '@nestjs/common';
import { Mutex } from 'async-mutex';
import { User } from 'src/data-store/entitiy/user.entity';
import { UserStoreCreateDto, UserStoreUpdateDto } from './dto';
import { DUPLICATE_EMAIL, NOT_FOUND } from './constant/store-error-message';

@Injectable()
export class UserStoreService {
  private userIdMap: { [id: number]: User };
  private userEmailIdMap: { [email: string]: number };
  private autoIncrement: number;
  private mutex: Mutex;

  constructor() {
    // this.userStore = [];
    this.userIdMap = {};
    this.userEmailIdMap = {};
    this.autoIncrement = 1;
    this.mutex = new Mutex();
  }

  async create(input: UserStoreCreateDto): Promise<User> {
    const release = await this.mutex.acquire();
    try {
      if (this.userEmailIdMap[input.email] !== undefined) {
        throw new Error(DUPLICATE_EMAIL);
      }

      for (
        ;
        this.userIdMap[this.autoIncrement] !== undefined;
        this.autoIncrement++
      ) {}

      const user: User = { id: this.autoIncrement, ...input };

      this.userIdMap[user.id] = user;
      this.userEmailIdMap[user.email] = user.id;
      this.autoIncrement++;
      return user;
    } finally {
      release();
    }
  }

  async update(id: number, input: UserStoreUpdateDto): Promise<User> {
    const release = await this.mutex.acquire();
    try {
      if (!this.userIdMap[id]) {
        throw new Error(NOT_FOUND);
      }

      // case change email, but email already there and belong to someonse else.

      if (
        input.email &&
        this.userEmailIdMap[input.email] !== undefined &&
        this.userEmailIdMap[input.email] !== id
      ) {
        throw new Error(DUPLICATE_EMAIL);
      }

      const prev = { ...this.userIdMap[id] };

      for (const key in input) {
        this.userIdMap[id][key] = input[key];
      }
      if (input.email !== prev.email) {
        delete this.userEmailIdMap[prev.email];
        this.userEmailIdMap[input.email] = id;
      }

      return this.userIdMap[id];
    } finally {
      release();
    }
  }

  async delete(id: number): Promise<boolean> {
    const release = await this.mutex.acquire();
    try {
      if (!this.userIdMap[id]) {
        throw new Error(NOT_FOUND);
      }
      const email = this.userIdMap[id].email;
      delete this.userIdMap[id];
      delete this.userEmailIdMap[email];

      return true;
    } finally {
      release();
    }
  }

  async findById(id: number): Promise<User> {
    // prevent ghost read
    const release = await this.mutex.acquire();
    try {
      if (!this.userIdMap[id]) {
        throw new Error(NOT_FOUND);
      }
      return this.userIdMap[id];
    } finally {
      release();
    }
  }

  async findByEmail(email: string): Promise<User> {
    const release = await this.mutex.acquire();
    try {
      if (!this.userEmailIdMap[email]) {
        throw new Error(NOT_FOUND);
      }
      const userId = this.userEmailIdMap[email];
      return this.userIdMap[userId];
    } finally {
      release();
    }
  }
}
