import { ModelDefinitions } from "../schema/definition/ModelDefinitions";
import { ColumnName } from "../schema/helpers/ColumnName";
import { ColumnType } from "../schema/helpers/ColumnType";
import { HasDefault } from "../schema/helpers/HasDefault";
import { IsNullable } from "../schema/helpers/IsNullable";
import { IsSerial } from "../schema/helpers/IsSerial";
import { ModelName } from "../schema/helpers/ModelName";
import { SelectClause } from "./SelectClause";

export type OptionalColumn<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
> = {
    [C in ColumnName<Models, M>]: IsNullable<Models, M, C> extends true
        ? C
        : IsSerial<Models, M, C> extends true
          ? C
          : HasDefault<Models, M, C> extends true
            ? C
            : never;
}[ColumnName<Models, M>];

export type OptionalParams<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
> =
    OptionalColumn<Models, M> extends never
        ? unknown
        : {
              [C in OptionalColumn<Models, M>]?: ColumnType<Models, M, C>;
          };

export type RequiredColumn<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
> = Exclude<ColumnName<Models, M>, OptionalColumn<Models, M>>;

export type RequiredParams<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
> =
    RequiredColumn<Models, M> extends never
        ? unknown
        : {
              [C in RequiredColumn<Models, M>]: ColumnType<Models, M, C>;
          };

export type CreateParams<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
> = {
    data: RequiredParams<Models, M> & OptionalParams<Models, M>;
    returning?: SelectClause<Models, M>;
};

export type Exactly<T, U> = T extends object
    ? U extends object
        ? { [K in keyof T]: K extends keyof U ? Exactly<T[K], U[K]> : never }
        : never
    : U;

export type ConstrainedCreateParams<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
    P extends CreateParams<Models, M>,
> = Omit<P, "data"> & {
    data: Exactly<P["data"], CreateParams<Models, M>["data"]>;
};
