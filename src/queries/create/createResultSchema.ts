import { BaseConfiguration } from "src/types/base/BaseConfiguration";
import { ZodSchema, z } from "zod";

import { BaseCreateManyParams } from "../../types/schema/helpers/queries/BaseCreateManyParams";
import { BaseCreateOneParams } from "../../types/schema/helpers/queries/BaseCreateOneParams";

export const createResultSchema = (
    config: BaseConfiguration,
    m: string,
    params: BaseCreateManyParams | BaseCreateOneParams,
) => {
    if (!params.returning) return z.number();

    const obj: Record<string, ZodSchema<unknown>> = {};

    params.returning?.forEach((s) => {
        const col = config.models[m].columns[s];
        obj[s] = col.nullable ? col.zodSchema.nullable() : col.zodSchema;
    });

    return z.object(obj);
};
