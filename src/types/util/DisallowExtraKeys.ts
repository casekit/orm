/**
 * Lets us specify a type as generic while still restricting
 * it to only have the keys expected by the type it extends.
 *
 * I don't understand why this works for nested keys, but it does.
 * It's also important, for some reason, that it uses
 * `{ [K in keyof T]: T[K] }` as its basis rather than the simpler `T`.
 *
 * Would have thought these might be equivalent but apparently not.
 */
export type DisallowExtraKeys<Base, T extends Base> = {
    [K in keyof T]: T[K];
} & {
    [K in keyof T as K extends keyof Base ? never : K]: never;
};
