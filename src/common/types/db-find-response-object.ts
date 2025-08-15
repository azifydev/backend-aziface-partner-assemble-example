import type { PrismaPromise } from '@prisma/client';

import type { DeepNullable } from './deep-partial-object';
import type { SnakeCaseLike } from './snake-like-object';

export type DBFindUniqueResponse<T> = Promise<
  DeepNullable<SnakeCaseLike<Omit<T, 'toDB'>>>
>;
export type DBFindManyResponse<T> = PrismaPromise<
  DeepNullable<SnakeCaseLike<Omit<T, 'toDB'>>>[]
>;
