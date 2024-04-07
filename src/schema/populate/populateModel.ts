import { mapValues } from "lodash-es";
import { BaseModel } from "src/types/base/BaseModel";

import { BaseConfiguration } from "../../types/base/BaseConfiguration";
import { ForeignKey } from "../../types/schema/constraints/ForeignKey";
import { UniqueConstraint } from "../../types/schema/constraints/UniqueConstraint";
import { ModelDefinition } from "../../types/schema/definitions/ModelDefinition";
import { suggestedColumnSchema } from "./suggestedColumnSchema";

export const populateModel = (
    config: Pick<BaseConfiguration, "naming" | "schema">,
    name: string,
    model: ModelDefinition,
): BaseModel => {
    const columns = mapValues(model.columns, (column, name) => ({
        name: column.name ?? config.naming.column(name),
        type: column.type,
        schema: column.schema ?? suggestedColumnSchema(column.type),
        nullable: column.nullable ?? false,
        default: column.default ?? null,
    }));

    const primaryKey =
        model.primaryKey ??
        Object.entries(model.columns)
            .filter(([, c]) => c.primaryKey)
            .map(([name, c]) => c.name ?? config.naming.column(name));

    const uniqueConstraints = [
        ...(model.uniqueConstraints ?? []),
        ...Object.entries(model.columns)
            .filter(([, c]) => c.unique)
            .map(([name, c]) => {
                if (c.unique === true) {
                    return { columns: [name] };
                } else if (c.unique === false) {
                    throw new Error(
                        "can't happen but let's make typescript happy",
                    );
                } else {
                    return {
                        columns: [name ?? config.naming.column(name)],
                        where: c.unique?.where,
                        nullsNotDistinct: c.unique?.nullsNotDistinct,
                    };
                }
            }),
    ] as UniqueConstraint[];

    const foreignKeys = [
        ...(model.foreignKeys ?? []).map((fk) => ({
            ...fk,
            references: {
                ...fk.references,
                schema:
                    fk.references.schema ??
                    model.schema ??
                    config.schema ??
                    "public",
            },
        })),
        ...Object.entries(model.columns)
            .filter(([, c]) => c.references)
            .map(([name, c]) => {
                if (!c.references) {
                    throw new Error(
                        "can't happen but let's make typescript happy",
                    );
                } else {
                    return {
                        columns: [c.name ?? config.naming.column(name)],
                        references: {
                            schema:
                                c.references.schema ??
                                model.schema ??
                                config.schema ??
                                "public",
                            table: c.references.table,
                            columns: [c.references.column],
                        },
                        onUpdate: c.references.onUpdate,
                        onDelete: c.references.onDelete,
                    };
                }
            }),
    ] as ForeignKey[];

    return {
        ...model,
        table: model.table ?? config.naming.table(name),
        schema: model.schema ?? config.schema ?? "public",
        columns,
        primaryKey,
        uniqueConstraints,
        foreignKeys,
    };
};
