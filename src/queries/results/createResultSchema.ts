import { ZodSchema, z } from "zod";

import { BaseCreateParams } from "../../types/queries/BaseCreateParams";
import { Schema } from "../../types/schema";

export const createResultSchema = (
    schema: Schema,
    m: keyof Schema["models"],
    params: BaseCreateParams,
) => {
    if (!params.returning) return z.boolean();

    const obj: Record<string, ZodSchema<unknown>> = {};

    params.returning?.forEach((s) => {
        const col = schema.models[m].columns[s];
        obj[s] = col.nullable ? col.schema.nullable() : col.schema;
    });

    return z.object(obj);
};
