import { BaseConfiguration } from "src/types/schema/BaseConfiguration";
import { ZodSchema, z } from "zod";

import { BaseQuery } from "../../types/queries/BaseQuery";

export const queryResultSchema = (
    schema: BaseConfiguration,
    m: string,
    query: BaseQuery,
) => {
    const obj: Record<string, ZodSchema<unknown>> = {};

    query.select.forEach((s) => {
        const col = schema.models[m].columns[s];
        obj[s] = col.nullable ? col.schema.nullable() : col.schema;
    });

    return z.object(obj);
};
