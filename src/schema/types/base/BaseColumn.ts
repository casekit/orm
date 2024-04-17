import { z } from "zod";

export type BaseColumn = {
    name: string;
    type: string;
    zodSchema: z.ZodType<unknown>;
    nullable: boolean;
    default?: unknown;
    provided: boolean;
};
