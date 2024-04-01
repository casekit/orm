import { ModelDefinitions } from "../schema/definition/ModelDefinitions";
import { ColumnName2 } from "../schema/helpers/ColumnName";
import { ColumnType } from "../schema/helpers/ColumnType";
import { HasDefault } from "../schema/helpers/HasDefault";
import { IsNullable } from "../schema/helpers/IsNullable";
import { IsSerial } from "../schema/helpers/IsSerial";
import { ModelName2 } from "../schema/helpers/ModelName";
import { SelectClause } from "./SelectClause";

export type OptionalColumn<
    Models extends ModelDefinitions,
    M extends ModelName2<Models>,
> = {
    [C in ColumnName2<Models, M>]: IsNullable<Models, M, C> extends true
        ? C
        : IsSerial<Models, M, C> extends true
          ? C
          : HasDefault<Models, M, C> extends true
            ? C
            : never;
}[ColumnName2<Models, M>];

export type OptionalParams<
    Models extends ModelDefinitions,
    M extends ModelName2<Models>,
> =
    OptionalColumn<Models, M> extends never
        ? unknown
        : {
              [C in OptionalColumn<Models, M>]?: ColumnType<Models, M, C>;
          };

export type RequiredColumn<
    Models extends ModelDefinitions,
    M extends ModelName2<Models>,
> = Exclude<ColumnName2<Models, M>, OptionalColumn<Models, M>>;

export type RequiredParams<
    Models extends ModelDefinitions,
    M extends ModelName2<Models>,
> =
    RequiredColumn<Models, M> extends never
        ? unknown
        : {
              [C in RequiredColumn<Models, M>]: ColumnType<Models, M, C>;
          };

export type CreateParams<
    Models extends ModelDefinitions,
    M extends ModelName2<Models>,
> = {
    data: RequiredParams<Models, M> & OptionalParams<Models, M>;
    returning?: SelectClause<Models, M>;
};
