import { ColumnType } from "../../../schema/types/helpers/ColumnType";
import { ModelName } from "../../../schema/types/helpers/ModelName";
import { LooseModelDefinitions } from "../../../schema/types/loose/LooseModelDefinitions";
import { OptionalColumn } from "./OptionalColumn";

export type OptionalParams<
    Models extends LooseModelDefinitions,
    M extends ModelName<Models>,
> =
    OptionalColumn<Models[M]> extends never
        ? unknown
        : {
              [C in OptionalColumn<Models[M]>]?: ColumnType<Models, M, C>;
          };
