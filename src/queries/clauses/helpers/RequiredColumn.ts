import { ColumnName } from "../../../schema/types/helpers/ColumnName";
import { ModelName } from "../../../schema/types/helpers/ModelName";
import { LooseModelDefinitions } from "../../../schema/types/loose/LooseModelDefinitions";
import { OptionalColumn } from "./OptionalColumn";

export type RequiredColumn<
    Models extends LooseModelDefinitions,
    M extends ModelName<Models>,
> = Exclude<ColumnName<Models, M>, OptionalColumn<Models, M>>;
