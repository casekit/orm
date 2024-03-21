import { z } from "zod";

import { SchemaDefinition } from "../definition/SchemaDefinition";
import { ColumnName } from "./ColumnName";
import { ModelName } from "./ModelName";

export type ColumnType<
    S extends SchemaDefinition,
    M extends ModelName<S>,
    C extends ColumnName<S, M>,
> = S["models"][M]["columns"][C]["nullable"] extends true
    ? z.infer<S["models"][M]["columns"][C]["schema"]> | null
    : z.infer<S["models"][M]["columns"][C]["schema"]>;
