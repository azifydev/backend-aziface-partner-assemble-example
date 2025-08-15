import { toCamelLike } from 'src/common/types/camel-like-object';
import type { DeepPartialNullable } from 'src/common/types/deep-partial-object';
import {
  type SnakeCaseLike,
  toSnakeLike,
} from 'src/common/types/snake-like-object';

import type { CreateSystemUserDto } from '../dto/create-system-user.dto';

export class SystemUser {
  id: string;

  name?: string;
  externalId?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;

  public constructor(builder: SnakeCaseLike<SystemUser>) {
    const self = toCamelLike(builder);
    this.id = self.id;

    this.name = self.name;
    this.externalId = self.externalId;
    this.createdAt = self.createdAt;
    this.updatedAt = self.updatedAt;
    this.deletedAt = self.deletedAt;
  }

  public static fromDB(
    data: SnakeCaseLike<DeepPartialNullable<SystemUser>>,
  ): SystemUser {
    const snakeLike = data;
    return new SystemUser(snakeLike as SnakeCaseLike<SystemUser>);
  }

  public get toDB(): SnakeCaseLike<SystemUser> {
    return toSnakeLike(this);
  }

  public static partialBuilder(builder: Partial<SystemUser>): SystemUser {
    const snakeLikeBuilder = toSnakeLike(builder);
    return new SystemUser(snakeLikeBuilder as SnakeCaseLike<SystemUser>);
  }

  public static fromDto(dto: CreateSystemUserDto): SystemUser {
    return SystemUser.partialBuilder(dto);
  }
}
