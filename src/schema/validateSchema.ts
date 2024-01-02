import { SchemaDefinition } from "~/types/schema/definition/SchemaDefinition";
import { DeepRequired } from "~/types/util/DeepRequired";

import { validateModel } from "./validateModel";

export const validateSchema = (schema: DeepRequired<SchemaDefinition>) => {
    for (const [name, model] of Object.entries(schema.models)) {
        validateModel(schema, name, model);
    }
};
