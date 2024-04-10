import { BaseConfiguration } from "src/types/base/BaseConfiguration";
import { ZodSchema, z } from "zod";

import { BaseQuery } from "../../types/schema/helpers/queries/BaseQuery";

export const findResultSchema = (
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
        const relation = config.relations[m][field];
        const schema = findResultSchema(config, relation.model, subquery!);
        obj[field] = relation.type === "N:1" ? schema : z.array(schema);
    }

    return z.object(obj);
};
