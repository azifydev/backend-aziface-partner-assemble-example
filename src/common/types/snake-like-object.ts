/* eslint-disable no-prototype-builtins */
/* eslint-disable security/detect-object-injection */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

type ToSnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Capitalize<T> ? '_' : ''}${Lowercase<T>}${ToSnakeCase<U>}`
  : S;

// Remove o underscore inicial se existir
type RemoveLeadingUnderscore<S extends string> = S extends `_${infer Rest}`
  ? Rest
  : S;

// Converte as chaves de um objeto para snake_case
export type SnakeCaseLike<T> = {
  [K in keyof T as RemoveLeadingUnderscore<ToSnakeCase<string & K>>]: T[K];
};

export const toSnakeLike = <T>(obj: T): SnakeCaseLike<T> => {
  const result = {} as SnakeCaseLike<T>;

  for (const key in obj) {
    if ((obj as object).hasOwnProperty(key)) {
      const snakeKey = key.replaceAll(/[A-Z]/g, (match, offset) =>
        offset > 0 ? `_${match.toLowerCase()}` : match.toLowerCase(),
      );

      (result as any)[snakeKey] = obj[key];
    }
  }

  return result;
};
