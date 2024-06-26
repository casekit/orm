import { BaseConfiguration } from "src/schema/types/base/BaseConfiguration";
import { ZodSchema, z } from "zod";

import { BaseFindParams } from "./types/BaseFindParams";

export const findResultSchema = (
    config: BaseConfiguration,
    m: string,
    query: BaseFindParams,
) => {
    const obj: Record<string, ZodSchema<unknown>> = {};

    query.select.forEach((field) => {
        const col = config.models[m].columns[field];
        obj[field] = col.nullable
            ? col.zodSchema.nullish().transform((x) => x ?? null)
            : col.zodSchema;
    });

    for (const [field, subquery] of Object.entries(query.include || {})) {
        const relation = config.relations[m][field];
        const schema = findResultSchema(config, relation.model, subquery!);
        obj[field] =
            relation.type === "N:1"
                ? relation.optional
                    ? schema.nullish().transform((x) => x ?? null)
                    : schema
                : z.array(schema);
    }

    return z.object(obj);
};
