import { BaseConfiguration } from "src/types/base/BaseConfiguration";
import { ZodSchema, z } from "zod";

import { BaseQuery } from "../../types/queries/BaseQuery";

export const queryResultSchema = (
    config: BaseConfiguration,
    m: string,
    query: BaseQuery,
) => {
    const obj: Record<string, ZodSchema<unknown>> = {};

    query.select.forEach((field) => {
        const col = config.models[m].columns[field];
        obj[field] = col.nullable ? col.zodSchema.nullable() : col.zodSchema;
    });

    for (const [field, subquery] of Object.entries(query.include || {})) {
        const model = config.relations[m][field]["model"];
        obj[field] = queryResultSchema(config, model, subquery!);
    }

    return z.object(obj);
};
