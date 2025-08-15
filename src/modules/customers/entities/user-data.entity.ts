import { toCamelLike } from 'src/common/types/camel-like-object';
import type { DeepPartialNullable } from 'src/common/types/deep-partial-object';
import {
  type SnakeCaseLike,
  toSnakeLike,
} from 'src/common/types/snake-like-object';

import type { UserDataDto } from '../schemas/users.dto';

export class UserData {
  id: string;
  userId: string;
  externalId: string;
  partnerId: string;
  corporateId: string;
  key: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;

  public constructor(builder: SnakeCaseLike<UserData>) {
    const self = toCamelLike(builder);
    this.id = self.id;
    this.userId = self.userId;
    this.partnerId = self.partnerId;
    this.corporateId = self.corporateId;
    this.key = self.key;
    this.value = self.value;
    this.createdAt = self.createdAt;
    this.updatedAt = self.updatedAt;
    this.deletedAt = self.deletedAt;
  }

  public get toDB(): SnakeCaseLike<UserData> {
    return toSnakeLike(this);
  }

  public static partialBuilder(builder: Partial<UserData>): UserData {
    const snakeLikeBuilder = toSnakeLike(builder);
    return new UserData(snakeLikeBuilder as SnakeCaseLike<UserData>);
  }

  public static fromDto(dto: UserDataDto): UserData {
    return UserData.partialBuilder(dto);
  }

  public static fromDB(
    data: SnakeCaseLike<DeepPartialNullable<UserData>>,
  ): UserData {
    const snakeLike = data;
    return new UserData(snakeLike as SnakeCaseLike<UserData>);
  }
}
