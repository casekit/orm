export type DeepRequired<T> = T extends (...args: unknown[]) => unknown
    ? T
    : T extends Record<string, unknown>
      ? { [K in keyof T]-?: Exclude<DeepRequired<T[K]>, null | undefined> }
      : T extends [infer Head, ...infer Tail]
        ? [DeepRequired<Head>, ...DeepRequired<Tail>]
        : T;
