import { describe, expect, test } from "vitest";

import { pullDefault } from "./pullDefault.js";

describe("pullDefault", () => {
    test("should return null for null values", () => {
        expect(pullDefault(null)).toBe(null);
    });

    test("should preserve timestamp literals as-is", () => {
        expect(
            pullDefault(
                "'2025-06-28 15:02:55.251517'::timestamp without time zone",
            ),
        ).toBe("'2025-06-28 15:02:55.251517'::timestamp without time zone");
        expect(
            pullDefault("'2025-06-28 15:02:55.251517+00'::timestamptz"),
        ).toBe("'2025-06-28 15:02:55.251517+00'::timestamptz");
        expect(pullDefault("'2023-01-01 12:00:00'::timestamp")).toBe(
            "'2023-01-01 12:00:00'::timestamp",
        );
        expect(
            pullDefault("'2025-06-28 15:02:55'::timestamp with time zone"),
        ).toBe("'2025-06-28 15:02:55'::timestamp with time zone");
    });

    test("should preserve SQL function calls", () => {
        expect(pullDefault("now()")).toBe("now()");
        expect(pullDefault("gen_random_uuid()")).toBe("gen_random_uuid()");
        expect(pullDefault("uuid_generate_v4()")).toBe("uuid_generate_v4()");
        expect(pullDefault("current_timestamp()")).toBe("current_timestamp()");
        expect(pullDefault("current_date()")).toBe("current_date()");
        expect(pullDefault("current_time()")).toBe("current_time()");
    });

    test("should preserve nextval sequences for serial types", () => {
        expect(pullDefault("nextval('user_id_seq'::regclass)")).toBe(
            "nextval('user_id_seq'::regclass)",
        );
        expect(pullDefault("nextval('public.post_id_seq'::regclass)")).toBe(
            "nextval('public.post_id_seq'::regclass)",
        );
    });

    test("should handle text literals with type casting", () => {
        expect(pullDefault("'hello'::text")).toBe("'hello'");
        expect(pullDefault("'world'::varchar")).toBe("'world'");
        expect(pullDefault("'test'::char")).toBe("'test'");
        expect(pullDefault("'example'::bpchar")).toBe("'example'");
    });

    test("should handle numeric literals with type casting", () => {
        expect(pullDefault("'123'::numeric")).toBe("123");
        expect(pullDefault("'456'::integer")).toBe("456");
        expect(pullDefault("'789'::bigint")).toBe("789");
        expect(pullDefault("'12.34'::decimal")).toBe("12.34");
        expect(pullDefault("'3.14'::real")).toBe("3.14");
        expect(pullDefault("'2.718'::double precision")).toBe("2.718");
        expect(pullDefault("'42'::smallint")).toBe("42");
        expect(pullDefault("'99.99'::float4")).toBe("99.99");
        expect(pullDefault("'88.88'::int4")).toBe("88.88");
    });

    test("should handle boolean literals", () => {
        expect(pullDefault("true")).toBe("true");
        expect(pullDefault("false")).toBe("false");
    });

    test("should handle NULL with type casting", () => {
        expect(pullDefault("NULL::text")).toBe(null);
        expect(pullDefault("NULL::integer")).toBe(null);
        expect(pullDefault("NULL::timestamp")).toBe(null);
    });

    test("should preserve array literals", () => {
        expect(pullDefault("ARRAY[1, 2, 3]")).toBe("ARRAY[1, 2, 3]");
        expect(pullDefault("ARRAY['foo', 'bar']")).toBe("ARRAY['foo', 'bar']");
        expect(pullDefault("ARRAY[ARRAY[ARRAY['a']]]")).toBe(
            "ARRAY[ARRAY[ARRAY['a']]]",
        );
        expect(pullDefault("{1, 2, 3}")).toBe("{1, 2, 3}");
        expect(pullDefault("{{foo, bar}, {baz, qux}}")).toBe(
            "{{foo, bar}, {baz, qux}}",
        );
    });

    test("should handle complex expressions as-is", () => {
        expect(pullDefault('\'{"key": "value"}\'::jsonb')).toBe(
            '\'{"key": "value"}\'::jsonb',
        );
        expect(pullDefault("'[]'::json")).toBe("'[]'::json");
        expect(pullDefault("'happy'::mood")).toBe("'happy'::mood");
        expect(pullDefault("'admin'::user_role")).toBe("'admin'::user_role");
        expect(pullDefault("'(0,0)'::point")).toBe("'(0,0)'::point");
        expect(pullDefault("'1 day'::interval")).toBe("'1 day'::interval");
    });

    test("should handle money defaults", () => {
        expect(pullDefault("42.42")).toBe("42.42");
        expect(pullDefault("$100.00")).toBe("$100.00");
    });

    test("should handle edge cases", () => {
        expect(pullDefault("")).toBe("");
        expect(pullDefault("0")).toBe("0");
        expect(pullDefault("-1")).toBe("-1");
        expect(pullDefault("'0'")).toBe("'0'");
    });

    test("should handle complex SQL expressions", () => {
        // These should be preserved as-is since they're complex
        expect(pullDefault("CASE WHEN foo = 'bar' THEN 1 ELSE 0 END")).toBe(
            "CASE WHEN foo = 'bar' THEN 1 ELSE 0 END",
        );
        expect(pullDefault("COALESCE(column1, column2, 'default')")).toBe(
            "COALESCE(column1, column2, 'default')",
        );
        expect(pullDefault("LENGTH('hello')")).toBe("LENGTH('hello')");
    });
});
