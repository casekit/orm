import { z } from "zod";

import { SchemaDefinition } from "../schema/definition/SchemaDefinition";
import { ColumnName } from "../schema/helpers/ColumnName";
import { Columns } from "../schema/helpers/Columns";
import { HasDefault } from "../schema/helpers/HasDefault";
import { IsNullable } from "../schema/helpers/IsNullable";
import { IsSerial } from "../schema/helpers/IsSerial";
import { ModelName } from "../schema/helpers/ModelName";
import { SelectClause } from "./SelectClause";

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

export type OptionalParams<S extends SchemaDefinition, M extends ModelName<S>> =
    OptionalColumn<S, M> extends never
        ? unknown
        : {
              [C in OptionalColumn<S, M>]?: z.infer<
                  Columns<S, M>[C]["schema"]
              > | null;
          };

export type RequiredColumn<
    S extends SchemaDefinition,
    M extends ModelName<S>,
> = Exclude<ColumnName<S, M>, OptionalColumn<S, M>>;

export type RequiredParams<S extends SchemaDefinition, M extends ModelName<S>> =
    RequiredColumn<S, M> extends never
        ? unknown
        : {
              [C in RequiredColumn<S, M>]: z.infer<Columns<S, M>[C]["schema"]>;
          };

export type CreateParams<S extends SchemaDefinition, M extends ModelName<S>> = {
    data: RequiredParams<S, M> & OptionalParams<S, M>;
    returning?: SelectClause<S, M>;
};
