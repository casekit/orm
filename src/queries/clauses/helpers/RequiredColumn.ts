import { ModelDefinitions } from "../../../schema/types/definitions/ModelDefinitions";
import { ColumnName } from "../../../schema/types/helpers/ColumnName";
import { ModelName } from "../../../schema/types/helpers/ModelName";
import { OptionalColumn } from "./OptionalColumn";

export type RequiredColumn<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
> = Exclude<ColumnName<Models, M>, OptionalColumn<Models, M>>;
