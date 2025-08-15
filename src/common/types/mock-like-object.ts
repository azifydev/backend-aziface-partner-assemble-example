/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable security/detect-object-injection */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { jest } from '@jest/globals';

import type { DeepPartialNullable } from './deep-partial-object';

// Tipo auxiliar para métodos que retornam objetos ou arrays de objetos
type MockedMethod<T> = T extends (...args: any[]) => Promise<infer R>
  ? jest.MockedFunction<
      (
        ...args: any[]
      ) => Promise<
        R extends (infer U)[]
          ? DeepPartialNullable<U>[]
          : DeepPartialNullable<R>
      >
    >
  : T extends (...args: any[]) => infer R
    ? jest.MockedFunction<
        (
          ...args: any[]
        ) => R extends (infer U)[]
          ? DeepPartialNullable<U>[]
          : DeepPartialNullable<R>
      >
    : never;

export type MockType<T> = {
  [P in keyof T]: T[P] extends (...args: any[]) => any
    ? MockedMethod<T[P]>
    : T[P] extends object
      ? MockType<T[P]>
      : jest.MockedFunction<() => T[P]>;
} & {
  asType(): T;
};

export function mockDeep<T>(obj: T, visited = new WeakSet()): MockType<T> {
  if (visited.has(obj as any)) {
    return {} as MockType<T>;
  }

  visited.add(obj as any);

  const mock: any = {};

  for (const key of Object.keys(obj as object)) {
    try {
      const value = obj[key as keyof T];

      if (typeof value === 'function') {
        mock[key] = jest.fn();
      } else if (typeof value === 'object' && value !== null) {
        // Pula certas propriedades que podem causar problemas
        if (key.startsWith('_') || key === 'constructor') {
          continue;
        }
        mock[key] = mockDeep(value, visited);
      } else {
        mock[key] = jest.fn(() => value);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`Erro ao criar mock para a propriedade "${key}": ${error}`);
      continue;
    }
  }

  // Adiciona o método asType que faz casting para o tipo original
  mock.asType = function (): T {
    return this as T;
  };

  return mock;
}
