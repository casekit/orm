import { ColumnName } from "../../../schema/types/helpers/ColumnName";
import { LooseModelDefinition } from "../../../schema/types/loose/LooseModelDefinition";
import { OptionalColumn } from "./OptionalColumn";

export type RequiredColumn<Model extends LooseModelDefinition> = Exclude<
    ColumnName<Model>,
    OptionalColumn<Model>
>;
