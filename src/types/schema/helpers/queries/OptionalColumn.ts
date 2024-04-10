import { ModelDefinitions } from "../../definitions/ModelDefinitions";
import { ColumnName } from "../ColumnName";
import { HasDefault } from "../HasDefault";
import { IsNullable } from "../IsNullable";
import { IsSerial } from "../IsSerial";
import { ModelName } from "../ModelName";

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
