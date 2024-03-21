import { ZodSchema, z } from "zod";
import { CreateParams } from "~/types/queries/CreateParams";
import { Schema } from "~/types/schema";

export const createResultSchema = (
    schema: Schema,
    m: keyof Schema["models"],
    params: CreateParams<Schema, string>,
) => {
    if (!params.returning) return z.boolean();

    const obj: Record<string, ZodSchema<unknown>> = {};

    params.returning?.forEach((s) => {
        const col = schema.models[m].columns[s];
        obj[s] = col.nullable ? col.schema.nullable() : col.schema;
    });

    return z.object(obj);
};
