import { z } from "zod";

import { SchemaDefinition } from "../schema/definition/SchemaDefinition";
import { ModelName } from "../schema/helpers/ModelName";
import { BaseQuery } from "./BaseQuery";

export type QueryResultRow<
    S extends SchemaDefinition,
    M extends ModelName<S>,
    Q extends BaseQuery,
> = Readonly<{
    [F in Q["select"][number]]: z.infer<S["models"][M]["columns"][F]["schema"]>;
}>;
