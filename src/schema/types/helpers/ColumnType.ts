import { z } from "zod";

import { SuggestedColumnType } from "../../populate/suggestedColumnSchema";
import { LooseModelDefinitions } from "../loose/LooseModelDefinitions";
import { ColumnName } from "./ColumnName";
import { ModelName } from "./ModelName";

type NonNullableColumnType<
    Models extends LooseModelDefinitions,
    M extends ModelName<Models>,
    C extends ColumnName<Models[M]>,
> =
    Models[M]["columns"][C]["zodSchema"] extends z.ZodType<unknown>
        ? z.infer<Models[M]["columns"][C]["zodSchema"]>
        : SuggestedColumnType<Models[M]["columns"][C]["type"]>;

export type ColumnType<
    Models extends LooseModelDefinitions,
    M extends ModelName<Models>,
    C extends ColumnName<Models[M]>,
> = Models[M]["columns"][C]["nullable"] extends true
    ? NonNullableColumnType<Models, M, C> | null
    : NonNullableColumnType<Models, M, C>;
