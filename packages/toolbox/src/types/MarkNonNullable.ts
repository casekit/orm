export type MarkNonNullable<Type, Keys extends keyof Type> = Type extends Type
    ? Type & { [Key in Keys]-?: NonNullable<Type[Key]> }
    : never;
