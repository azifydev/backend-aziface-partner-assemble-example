export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[P] extends readonly (infer U)[]
      ? readonly DeepPartial<U>[]
      : T[P] extends object
        ? DeepPartial<T[P]>
        : T[P];
};

export type DeepNullable<T> = {
  [P in keyof T]: T[P] extends (infer U)[]
    ? DeepNullable<U>[] | null
    : T[P] extends readonly (infer U)[]
      ? readonly DeepNullable<U>[] | null
      : T[P] extends object
        ? DeepNullable<T[P]> | null
        : T[P] | null;
};

export type DeepPartialNullable<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartialNullable<U>[] | null
    : T[P] extends readonly (infer U)[]
      ? readonly DeepPartialNullable<U>[] | null
      : T[P] extends object
        ? DeepPartialNullable<T[P]> | null
        : T[P] | null;
};
