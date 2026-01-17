import { describe, expect, test } from "vitest";

import { isNumeric, renderDefault } from "./renderDefault.js";

describe("isNumeric", () => {
    test("should return true for integers", () => {
        expect(isNumeric("42")).toBe(true);
        expect(isNumeric("-123")).toBe(true);
        expect(isNumeric("0")).toBe(true);
    });

    test("should return true for decimal numbers", () => {
        expect(isNumeric("3.14")).toBe(true);
        expect(isNumeric("-0.5")).toBe(true);
        expect(isNumeric("0.0")).toBe(true);
    });

    test("should return false for non-numeric strings", () => {
        expect(isNumeric("abc")).toBe(false);
        expect(isNumeric("12.34.56")).toBe(false);
        expect(isNumeric("12abc")).toBe(false);
        expect(isNumeric("")).toBe(false);
        expect(isNumeric(" ")).toBe(false);
    });
});

describe("renderDefault", () => {
    test("should return empty string for SERIAL types", () => {
        expect(renderDefault("SERIAL", "1")).toBe("");
        expect(renderDefault("BIGSERIAL", "1")).toBe("");
    });

    test("should return empty string for null values", () => {
        expect(renderDefault("TEXT", null)).toBe("");
    });

    test("should handle numeric defaults", () => {
        expect(renderDefault("INTEGER", "42")).toBe("default: 42,");
        expect(renderDefault("DECIMAL", "-1.5")).toBe("default: -1.5,");
    });

    test("should handle boolean defaults", () => {
        expect(renderDefault("BOOLEAN", "true")).toBe("default: true,");
        expect(renderDefault("BOOLEAN", "false")).toBe("default: false,");
        expect(renderDefault("BOOLEAN", "TRUE")).toBe("default: true,");
        expect(renderDefault("BOOLEAN", "FALSE")).toBe("default: false,");
    });

    test("should handle text defaults", () => {
        expect(renderDefault("TEXT", "'hello'::text")).toBe(
            'default: "hello",',
        );
    });

    test("should handle numeric with type specifier", () => {
        expect(renderDefault("NUMERIC", "'123'::numeric")).toBe(
            "default: 123,",
        );
        expect(renderDefault("NUMERIC", "456::numeric")).toBe("default: 456,");
    });

    test("should wrap functions in sql tag", () => {
        expect(renderDefault("TIMESTAMP", "now()")).toBe(
            "default: sql`now()`,",
        );
        expect(renderDefault("UUID", "gen_random_uuid()")).toBe(
            "default: sql`gen_random_uuid()`,",
        );
    });

    test("should handle array defaults", () => {
        expect(renderDefault("INTEGER[]", "ARRAY[1, 2, 3]")).toBe(
            "default: sql`ARRAY[1, 2, 3]`,",
        );
        expect(renderDefault("TEXT[]", "ARRAY['foo', 'bar']")).toBe(
            "default: sql`ARRAY['foo', 'bar']`,",
        );
    });

    test("should handle JSON defaults", () => {
        expect(renderDefault("JSONB", `'{"key": "value"}'::jsonb`)).toBe(
            `default: sql\`'{"key": "value"}'::jsonb\`,`,
        );
        expect(renderDefault("JSON", "'[]'::json")).toBe(
            "default: sql`'[]'::json`,",
        );
    });

    test("should handle enum defaults", () => {
        expect(renderDefault("mood", "'happy'::mood")).toBe(
            "default: sql`'happy'::mood`,",
        );
        expect(renderDefault("user_role", "'admin'::user_role")).toBe(
            "default: sql`'admin'::user_role`,",
        );
    });

    test("should handle compound defaults", () => {
        expect(renderDefault("point", "'(0,0)'::point")).toBe(
            "default: sql`'(0,0)'::point`,",
        );
        expect(renderDefault("interval", "'1 day'::interval")).toBe(
            "default: sql`'1 day'::interval`,",
        );
    });
});
