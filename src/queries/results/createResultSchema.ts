import { BaseConfiguration } from "src/types/base/BaseConfiguration";
import { ZodSchema, z } from "zod";

import { BaseCreateParams } from "../../types/queries/BaseCreateParams";

export const createResultSchema = (
    schema: BaseConfiguration,
    m: string,
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
