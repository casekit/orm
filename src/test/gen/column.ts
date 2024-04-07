import { fc } from "@fast-check/vitest";
import { z } from "zod";

import { ColumnDefinition } from "../../types/schema/definitions/ColumnDefinition";
import { DataType } from "../../types/schema/postgres/DataType";
import { sqldate } from "./sqldate";

export const column = () => {
    return fc.oneof(
        fc.record<ColumnDefinition>({
            name: fc.string({ minLength: 1, maxLength: 80 }),
            nullable: fc.boolean(),
            zodSchema: fc.constant(z.string()),
            type: fc.constant<DataType>("text"),
            default: fc.oneof(fc.string(), fc.constant(null)),
        }),
        fc.record<ColumnDefinition>({
            name: fc.string({ minLength: 1, maxLength: 80 }),
            nullable: fc.boolean(),
            zodSchema: fc.constant(z.string().uuid()),
            type: fc.constant<DataType>("uuid"),
            default: fc.oneof(fc.uuid(), fc.constant(null)),
        }),
        fc.record<ColumnDefinition>({
            name: fc.string({ minLength: 1, maxLength: 80 }),
            nullable: fc.boolean(),
            zodSchema: fc.constant(z.number()),
            type: fc.constant<DataType>("bigint"),
            default: fc.oneof(fc.integer(), fc.constant(null)),
        }),
        fc.record<ColumnDefinition>({
            name: fc.string({ minLength: 1, maxLength: 80 }),
            nullable: fc.boolean(),
            zodSchema: fc.constant(z.date()),
            type: fc.constant<DataType>("timestamp"),
            default: fc.oneof(sqldate(), fc.constant(null)),
        }),
    );
};
