import { z } from "zod";

import { SchemaDefinition } from "../schema/definition/SchemaDefinition";
import { ModelName } from "../schema/helpers/ModelName";

export type QueryResultRow<
    S extends SchemaDefinition,
    M extends ModelName<S>,
> = {
    [K in keyof S["models"][M]["columns"]]: z.infer<
        S["models"][M]["columns"][K]["schema"]
    >;
};
