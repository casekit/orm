import { z } from "zod";

import { SuggestedColumnType } from "../../../schema/suggestedColumnSchema";
import { ModelDefinitions } from "../definitions/ModelDefinitions";
import { ColumnName } from "./ColumnName";
import { ModelName } from "./ModelName";

type NonNullableColumnType<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
    C extends ColumnName<Models, M>,
> =
    Models[M]["columns"][C]["schema"] extends z.ZodType<unknown>
        ? z.infer<Models[M]["columns"][C]["schema"]>
        : SuggestedColumnType<Models[M]["columns"][C]["type"]>;

export type ColumnType<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
    C extends ColumnName<Models, M>,
> = Models[M]["columns"][C]["nullable"] extends true
    ? NonNullableColumnType<Models, M, C> | null
    : NonNullableColumnType<Models, M, C>;
