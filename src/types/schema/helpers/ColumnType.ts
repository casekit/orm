import { z } from "zod";

import { SuggestedColumnType } from "../../../schema/suggestedColumnSchema";
import { SchemaDefinition } from "../definition/SchemaDefinition";
import { ColumnName } from "./ColumnName";
import { ModelName } from "./ModelName";

type NonNullableColumnType<
    S extends SchemaDefinition,
    M extends ModelName<S>,
    C extends ColumnName<S, M>,
> =
    S["models"][M]["columns"][C]["schema"] extends z.ZodType<unknown>
        ? z.infer<S["models"][M]["columns"][C]["schema"]>
        : SuggestedColumnType<S["models"][M]["columns"][C]["type"]>;

export type ColumnType<
    S extends SchemaDefinition,
    M extends ModelName<S>,
    C extends ColumnName<S, M>,
> = S["models"][M]["columns"][C]["nullable"] extends true
    ? NonNullableColumnType<S, M, C> | null
    : NonNullableColumnType<S, M, C>;
