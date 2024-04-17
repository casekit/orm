import { ColumnType } from "../../../schema/types/helpers/ColumnType";
import { ModelName } from "../../../schema/types/helpers/ModelName";
import { LooseModelDefinitions } from "../../../schema/types/loose/LooseModelDefinitions";
import { RequiredColumn } from "./RequiredColumn";

export type RequiredParams<
    Models extends LooseModelDefinitions,
    M extends ModelName<Models>,
> =
    RequiredColumn<Models, M> extends never
        ? unknown
        : {
              [C in RequiredColumn<Models, M>]: ColumnType<Models, M, C>;
          };
