import { ModelDefinitions } from "../../../schema/types/definitions/ModelDefinitions";
import { ColumnName } from "../../../schema/types/helpers/ColumnName";
import { HasDefault } from "../../../schema/types/helpers/HasDefault";
import { IsNullable } from "../../../schema/types/helpers/IsNullable";
import { IsSerial } from "../../../schema/types/helpers/IsSerial";
import { ModelName } from "../../../schema/types/helpers/ModelName";

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
