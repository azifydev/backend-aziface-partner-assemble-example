/* eslint-disable security/detect-object-injection */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable no-prototype-builtins */
type ToCamelCase<S extends string> = S extends `${infer Before}_${infer After}`
  ? `${Before}${Capitalize<ToCamelCase<After>>}`
  : S;

// Converte as chaves de um objeto para camelCase
export type CamelLike<T> = {
  [K in keyof T as ToCamelCase<string & K>]: T[K];
};

export const toCamelLike = <T>(obj: T): CamelLike<T> => {
  const result = {} as CamelLike<T>;

  for (const key in obj) {
    if ((obj as object).hasOwnProperty(key)) {
      const camelKey = (key as string).replaceAll(
        /_([a-z])/g,
        (_, letter: string) => letter.toUpperCase(),
      );

      (result as any)[camelKey] = obj[key];
    }
  }

  return result;
};
