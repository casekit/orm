import { ModelDefinitions } from "../../../schema/types/definitions/ModelDefinitions";
import { RelationsDefinitions } from "../../../schema/types/definitions/RelationsDefinitions";
import { ColumnName } from "../../../schema/types/helpers/ColumnName";
import { ColumnType } from "../../../schema/types/helpers/ColumnType";
import { ModelName } from "../../../schema/types/helpers/ModelName";
import { Configuration } from "../../../types/Configuration";

export type UpdateValuesMiddleware<
    Models extends ModelDefinitions,
    Relations extends RelationsDefinitions<Models>,
> = <M extends ModelName<Models>>(
    config: Configuration<Models, Relations>,
    m: M,
    values: { [C in ColumnName<Models, M>]?: ColumnType<Models, M, C> },
) => { [C in ColumnName<Models, M>]?: ColumnType<Models, M, C> };
