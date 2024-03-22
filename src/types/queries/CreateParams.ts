import { z } from "zod";

import { SchemaDefinition } from "../schema/definition/SchemaDefinition";
import { ColumnName } from "../schema/helpers/ColumnName";
import { Columns } from "../schema/helpers/Columns";
import { ModelName } from "../schema/helpers/ModelName";
import { SelectClause } from "./SelectClause";

export type IsSerial<
    S extends SchemaDefinition,
    M extends ModelName<S>,
    C extends keyof Columns<S, M>,
> = Columns<S, M>[C]["type"] extends "serial" | "bigserial" | "smallserial"
    ? true
    : false;

export type IsNullable<
    S extends SchemaDefinition,
    M extends ModelName<S>,
    C extends keyof Columns<S, M>,
> = Columns<S, M>[C]["nullable"] extends true ? true : false;

export type HasDefault<
    S extends SchemaDefinition,
    M extends ModelName<S>,
    C extends keyof Columns<S, M>,
> = null extends Columns<S, M>[C]["default"]
    ? false
    : undefined extends Columns<S, M>[C]["default"]
      ? false
      : true;

export type OptionalColumn<
    S extends SchemaDefinition,
    M extends ModelName<S>,
> = {
    [C in ColumnName<S, M>]: IsNullable<S, M, C> extends true
        ? C
        : IsSerial<S, M, C> extends true
          ? C
          : HasDefault<S, M, C> extends true
            ? C
            : never;
}[ColumnName<S, M>];

export type RequiredColumn<
    S extends SchemaDefinition,
    M extends ModelName<S>,
> = Exclude<ColumnName<S, M>, OptionalColumn<S, M>>;

export type CreateParams<S extends SchemaDefinition, M extends ModelName<S>> = {
    data: {
        [C in RequiredColumn<S, M>]: z.infer<Columns<S, M>[C]["schema"]>;
    } & {
        [C in OptionalColumn<S, M>]?: z.infer<
            Columns<S, M>[C]["schema"]
        > | null;
    };
    returning?: SelectClause<S, M>;
};
