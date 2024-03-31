import { Config } from "../types/Config";
import { Model } from "../types/schema";
import { ModelDefinition } from "../types/schema/definition/ModelDefinition";
import { UniqueConstraint } from "../types/schema/definition/UniqueConstraint";
import { suggestedColumnSchema } from "./suggestedColumnSchema";

export const populateModel = (
    config: Config,
    name: string,
    model: ModelDefinition,
): Model => {
    const columns = Object.fromEntries(
        Object.entries(model.columns).map(([name, column]) => [
            name,
            {
                name: column.name ?? config.naming.column(name),
                type: column.type,
                schema: column.schema ?? suggestedColumnSchema(column.type),
                nullable: column.nullable ?? false,
                default: column.default ?? null,
            },
        ]),
    );

    const primaryKey =
        model.primaryKey ??
        Object.entries(model.columns)
            .filter(([, c]) => c.primaryKey)
            .map(([name]) => name);

    const uniqueConstraints = [
        ...(model.uniqueConstraints ?? []),
        ...Object.entries(model.columns)
            .filter(([, c]) => c.unique)
            .map(([name, { unique }]) => {
                if (unique === true) {
                    return { columns: [name] };
                } else if (unique === false) {
                    throw new Error(
                        "can't happen but let's make typescript happy",
                    );
                } else {
                    return {
                        columns: [name],
                        where: unique?.where,
                        nullsNotDistinct: unique?.nullsNotDistinct,
                    };
                }
            }),
    ] as UniqueConstraint[];

    return {
        ...model,
        table: model.table ?? config.naming.table(name),
        schema: model.schema ?? config.schema ?? "public",
        columns,
        primaryKey,
        uniqueConstraints,
        foreignKeys: [],
    };
};
