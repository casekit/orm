import { describe, expect, test } from "vitest";

import type { Column } from "@casekit/orm-migrate";

import { renderType } from "./renderType.js";

describe("renderType", () => {
    const createColumn = (
        type: string,
        elementType?: string | null,
        cardinality?: number,
    ): Column => ({
        schema: "public",
        table: "test",
        column: "test_column",
        ordinalPosition: 1,
        type,
        default: null,
        nullable: false,
        udtSchema: "pg_catalog",
        udt: "test",
        elementType: elementType ?? null,
        elementTypeSchema: null,
        cardinality: cardinality ?? 0,
        size: null,
        isSerial: false,
    });

    describe("Array types", () => {
        test("renders ARRAY types with element types", () => {
            expect(renderType(createColumn("ARRAY", "integer", 1))).toBe(
                "integer[]",
            );
            expect(renderType(createColumn("ARRAY", "text", 1))).toBe("text[]");
            expect(renderType(createColumn("ARRAY", "varchar", 2))).toBe(
                "varchar[][]",
            );
            expect(renderType(createColumn("ARRAY", "boolean", 3))).toBe(
                "boolean[][][]",
            );
        });

        test("handles array type shortcuts", () => {
            expect(renderType(createColumn("_text"))).toBe("text[]");
            expect(renderType(createColumn("_int4"))).toBe("integer[]");
            expect(renderType(createColumn("_varchar"))).toBe("varchar[]");
            expect(renderType(createColumn("_bool"))).toBe("boolean[]");
        });

        test("handles ARRAY type without elementType", () => {
            expect(renderType(createColumn("ARRAY", null))).toBe("ARRAY");
        });
    });

    describe("Pass-through types", () => {
        test("passes through all non-array types unchanged", () => {
            expect(renderType(createColumn("integer"))).toBe("integer");
            expect(renderType(createColumn("character varying"))).toBe(
                "character varying",
            );
            expect(renderType(createColumn("timestamp with time zone"))).toBe(
                "timestamp with time zone",
            );
            expect(renderType(createColumn("numeric(10,2)"))).toBe(
                "numeric(10,2)",
            );
            expect(renderType(createColumn("custom_enum_type"))).toBe(
                "custom_enum_type",
            );
        });
    });
});
