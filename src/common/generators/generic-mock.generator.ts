/* eslint-disable @typescript-eslint/no-unnecessary-condition */

import type { DeepPartialNullable } from '../types/deep-partial-object';
import { type MockType, mockDeep } from '../types/mock-like-object';

export type MockKeys<T> = {
  $mockedKeys: (keyof T)[];
};

export function generateAllMock(keys: (keyof any)[]): MockKeys<any> {
  const data: Record<string, any> = {};
  for (const key of keys) {
    data[key as string] = jest.fn();
  }

  return {
    ...data,
  } as MockKeys<any>;
}

export function generateMock<T extends object = any>(
  instance: DeepPartialNullable<T> | MockKeys<T>,
): MockType<T> {
  let realInstance = instance;

  if (instance && '$mockedKeys' in instance) {
    realInstance = generateAllMock(instance.$mockedKeys);
  }

  return mockDeep<T>(realInstance as T);
}
