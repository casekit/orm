import { z } from "zod";

import { SuggestedColumnType } from "../schema/populate/suggestedColumnSchema";
import { LooseModelDefinition } from "../schema/types/loose/LooseModelDefinition";
import { ColumnName } from "./ColumnName";

type NonNullableColumnType<
    Model extends LooseModelDefinition,
    C extends ColumnName<Model>,
> =
    Model["columns"][C]["zodSchema"] extends z.ZodType<unknown>
        ? z.infer<Model["columns"][C]["zodSchema"]>
        : SuggestedColumnType<Model["columns"][C]["type"]>;

export type ColumnType<
    Model extends LooseModelDefinition,
    C extends ColumnName<Model>,
> = Model["columns"][C]["nullable"] extends true
    ? NonNullableColumnType<Model, C> | null
    : NonNullableColumnType<Model, C>;
