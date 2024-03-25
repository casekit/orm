import { Config } from "../types/Config";
import { Model } from "../types/schema";
import { ModelDefinition } from "../types/schema/definition/ModelDefinition";
import { suggestedColumnSchema } from "./suggestedColumnSchema";

export const populateModel = (
    config: Config,
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
                nullable: column.nullable ?? false,
                default: column.default ?? null,
                schema: column.schema ?? suggestedColumnSchema(column.type),
            },
        ]),
    ),
    constraints: {
        ...model.constraints,
        primaryKey: model.constraints?.primaryKey ?? [],
        unique: [...(model.constraints?.unique ?? [])],
    },
});
