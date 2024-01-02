import { fc } from "@fast-check/vitest";
import { z } from "zod";
import { Column } from "~/types/schema";
import { DataType } from "~/types/schema/postgres/DataType";

export const column = () => {
    return fc
        .tuple(
            fc.record({
                name: fc.string({ minLength: 1, maxLength: 80 }),
                fieldName: fc.string({ minLength: 1, maxLength: 80 }),
            }),
            fc.oneof(
                fc.record({
                    schema: fc.constant(z.string()),
                    type: fc.constant<DataType>("text"),
                }),
                fc.record({
                    schema: fc.constant(z.string().uuid()),
                    type: fc.constant<DataType>("uuid"),
                }),
                fc.record({
                    schema: fc.constant(z.number()),
                    type: fc.constant<DataType>("bigint"),
                }),
                fc.record({
                    schema: fc.constant(z.date()),
                    type: fc.constant<DataType>("timestamp"),
                }),
            ),
            fc.oneof(
                fc.record({
                    primaryKey: fc.constant(true),
                    nullable: fc.constant(false),
                    unique: fc.boolean(),
                }),
                fc.record({
                    primaryKey: fc.constant(false),
                    nullable: fc.boolean(),
                    unique: fc.boolean(),
                }),
            ),
        )
        .map<Column>(([names, type, constraints]) => ({
            ...names,
            ...type,
            ...constraints,
        }));
};
