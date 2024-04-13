import { BaseConfiguration } from "src/schema/types/base/BaseConfiguration";
import { ZodSchema, z } from "zod";

import { BaseDeleteParams } from "./types/BaseDeleteParams";

export const deleteResultSchema = (
    config: BaseConfiguration,
    m: string,
    params: BaseDeleteParams,
) => {
    if (!params.returning) return z.number();

    const obj: Record<string, ZodSchema<unknown>> = {};

    params.returning?.forEach((s) => {
        const col = config.models[m].columns[s];
        obj[s] = col.nullable ? col.zodSchema.nullable() : col.zodSchema;
    });

    return z.object(obj);
};
