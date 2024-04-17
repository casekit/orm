import { ColumnName } from "../../../schema/types/helpers/ColumnName";
import { HasDefault } from "../../../schema/types/helpers/HasDefault";
import { IsNullable } from "../../../schema/types/helpers/IsNullable";
import { IsSerial } from "../../../schema/types/helpers/IsSerial";
import { ModelName } from "../../../schema/types/helpers/ModelName";
import { LooseModelDefinitions } from "../../../schema/types/loose/LooseModelDefinitions";

export type OptionalColumn<
    Models extends LooseModelDefinitions,
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
