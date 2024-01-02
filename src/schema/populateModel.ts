import { Config } from "~/types/Config";
import { Model } from "~/types/schema";
import { ModelDefinition } from "~/types/schema/definition/ModelDefinition";
import { DeepRequired } from "~/types/util/DeepRequired";

export const populateModel = (
    config: DeepRequired<Config>,
    name: string,
    model: ModelDefinition,
): Model => ({
    ...model,
    table: model.table ?? config.naming.table(name),
    schema: model.schema ?? config.schema ?? "public",
    columns: Object.fromEntries(
        Object.entries(model.columns).map(([name, column]) => [
            name,
            {
                ...column,
                fieldName: name,
                name: column.name ?? config.naming.column(name),
                primaryKey: column.primaryKey ?? false,
                unique: column.unique ?? false,
                nullable: column.nullable ?? false,
            },
        ]),
    ),
});
