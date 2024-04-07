import { z } from "zod";

export type BaseColumn = {
    name: string;
    type: string;
    schema: z.ZodType<unknown>;
    nullable: boolean;
    default?: unknown;
};
