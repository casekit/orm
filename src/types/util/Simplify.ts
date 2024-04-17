import { SQLStatement } from "../../sql";

export type Simplify<T> = {
    [K in keyof T]: T[K] extends Date
        ? T[K]
        : T[K] extends SQLStatement
          ? T[K]
          : T[K] extends object
            ? Simplify<T[K]>
            : T[K];
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
} & unknown;
