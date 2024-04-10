import { ModelDefinitions } from "../../definitions/ModelDefinitions";
import { ColumnName } from "../ColumnName";
import { ModelName } from "../ModelName";
import { OptionalColumn } from "./OptionalColumn";

export type RequiredColumn<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
> = Exclude<ColumnName<Models, M>, OptionalColumn<Models, M>>;
