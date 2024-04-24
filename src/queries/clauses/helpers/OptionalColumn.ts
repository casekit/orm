import { ColumnName } from "../../../schema/types/helpers/ColumnName";
import { HasDefault } from "../../../schema/types/helpers/HasDefault";
import { IsNullable } from "../../../schema/types/helpers/IsNullable";
import { IsProvided } from "../../../schema/types/helpers/IsProvided";
import { IsSerial } from "../../../schema/types/helpers/IsSerial";
import { LooseModelDefinition } from "../../../schema/types/loose/LooseModelDefinition";

export type OptionalColumn<Model extends LooseModelDefinition> = {
    [C in ColumnName<Model>]: IsNullable<Model, C> extends true
        ? C
        : IsSerial<Model, C> extends true
          ? C
          : HasDefault<Model, C> extends true
            ? C
            : IsProvided<Model, C> extends true
              ? C
              : never;
}[ColumnName<Model>];
