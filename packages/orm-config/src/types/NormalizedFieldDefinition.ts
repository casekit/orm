import { z } from "zod";

export interface NormalizedFieldDefinition {
    name: string;
    column: string;
    type: string;
    zodSchema: z.ZodType;
    nullable: boolean;
    default: unknown;
    provided?: boolean;
}
