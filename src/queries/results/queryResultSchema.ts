import { ZodSchema, z } from "zod";

import { BaseQuery } from "../../types/queries/BaseQuery";
import { Schema } from "../../types/schema";

export const queryResultSchema = (
    schema: Schema,
    m: keyof Schema["models"],
    query: BaseQuery,
) => {
    const obj: Record<string, ZodSchema<unknown>> = {};

    query.select.forEach((s) => {
        const col = schema.models[m].columns[s];
        obj[s] = col.nullable ? col.schema.nullable() : col.schema;
    });

    return z.object(obj);
};
