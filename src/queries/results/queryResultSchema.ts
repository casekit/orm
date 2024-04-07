import { BaseConfiguration } from "src/types/base/BaseConfiguration";
import { ZodSchema, z } from "zod";

import { BaseQuery } from "../../types/queries/BaseQuery";

export const queryResultSchema = (
    config: BaseConfiguration,
    m: string,
    query: BaseQuery,
) => {
    const obj: Record<string, ZodSchema<unknown>> = {};

    query.select.forEach((s) => {
        const col = config.models[m].columns[s];
        obj[s] = col.nullable ? col.zodSchema.nullable() : col.zodSchema;
    });

    return z.object(obj);
};
