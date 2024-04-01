import { z } from "zod";

import { SuggestedColumnType } from "../../../schema/suggestedColumnSchema";
import { ModelDefinitions } from "../definition/ModelDefinitions";
import { ColumnName2 } from "./ColumnName";
import { ModelName2 } from "./ModelName";

type NonNullableColumnType<
    Models extends ModelDefinitions,
    M extends ModelName2<Models>,
    C extends ColumnName2<Models, M>,
> =
    Models[M]["columns"][C]["schema"] extends z.ZodType<unknown>
        ? z.infer<Models[M]["columns"][C]["schema"]>
        : SuggestedColumnType<Models[M]["columns"][C]["type"]>;

export type ColumnType<
    Models extends ModelDefinitions,
    M extends ModelName2<Models>,
    C extends ColumnName2<Models, M>,
> = Models[M]["columns"][C]["nullable"] extends true
    ? NonNullableColumnType<Models, M, C> | null
    : NonNullableColumnType<Models, M, C>;
