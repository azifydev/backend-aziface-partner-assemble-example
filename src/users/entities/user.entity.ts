import { toCamelLike } from 'src/common/types/camel-like-object';
import type { DeepPartialNullable } from 'src/common/types/deep-partial-object';
import {
  type SnakeCaseLike,
  toSnakeLike,
} from 'src/common/types/snake-like-object';

import type { CreateUserDto } from '../dto/create-user.dto';

export class User {
  id: string;

  name?: string;
  assembleUserId?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;

  public constructor(builder: SnakeCaseLike<User>) {
    const self = toCamelLike(builder);
    this.id = self.id;

    this.name = self.name;
    this.assembleUserId = self.assembleUserId;
    this.createdAt = self.createdAt;
    this.updatedAt = self.updatedAt;
    this.deletedAt = self.deletedAt;
  }

  public static fromDB(data: SnakeCaseLike<DeepPartialNullable<User>>): User {
    const snakeLike = data;
    return new User(snakeLike as SnakeCaseLike<User>);
  }

  public get toDB(): SnakeCaseLike<User> {
    return toSnakeLike(this);
  }

  public static partialBuilder(builder: Partial<User>): User {
    const snakeLikeBuilder = toSnakeLike(builder);
    return new User(snakeLikeBuilder as SnakeCaseLike<User>);
  }

  public static fromDto(dto: CreateUserDto): User {
    return User.partialBuilder(dto);
  }
}
