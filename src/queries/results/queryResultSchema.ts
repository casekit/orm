import { ZodSchema, z } from "zod";

import { BaseQuery } from "../../types/queries/BaseQuery";
import { PopulatedSchema } from "../../types/schema";
import { ModelDefinitions } from "../../types/schema/definition/ModelDefinitions";

export const queryResultSchema = <Models extends ModelDefinitions>(
    schema: PopulatedSchema<Models>,
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
