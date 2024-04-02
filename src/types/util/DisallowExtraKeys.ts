export type DisallowExtraKeys<Base, T extends Base> = {
    [K in keyof T]: T[K];
} & {
    [K in keyof T as K extends keyof Base ? never : K]: never;
};
