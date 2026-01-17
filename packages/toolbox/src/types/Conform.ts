/**
 * Not really an exact type and not exactly what we'd like -
 * all we need is excess property checking, but that's
 * unlikely to happen. See https://github.com/microsoft/TypeScript/issues/58031
 * for more information.
 */
export type Conform<Base, T extends Base> = {
    [K in keyof T]: T[K];
} & {
    [K in keyof T as K extends keyof Base ? never : K]: never;
};
