import { BaseConfiguration } from "src/schema/types/base/BaseConfiguration";
import { ZodSchema, z } from "zod";

import { BaseUpdateParams } from "../types/base/BaseUpdateParams";

export const updateResultSchema = (
    config: BaseConfiguration,
    m: string,
    params: BaseUpdateParams,
) => {
    if (!params.returning) return z.number();

    const obj: Record<string, ZodSchema<unknown>> = {};

    params.returning?.forEach((s) => {
        const col = config.models[m].columns[s];
        obj[s] = col.nullable ? col.zodSchema.nullable() : col.zodSchema;
    });

    return z.object(obj);
};
