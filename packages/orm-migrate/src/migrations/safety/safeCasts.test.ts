import { describe, expect, test } from "vitest";

import { isSafeCast } from "./safeCasts.js";

describe("isSafeCast", () => {
    test("same type is always safe", () => {
        expect(isSafeCast("integer", "integer")).toBe(true);
        expect(isSafeCast("text", "text")).toBe(true);
        expect(isSafeCast("varchar(255)", "varchar(255)")).toBe(true);
    });

    test("normalised aliases are treated as same type", () => {
        expect(isSafeCast("int", "integer")).toBe(true);
        expect(isSafeCast("int4", "integer")).toBe(true);
        expect(isSafeCast("int2", "smallint")).toBe(true);
        expect(isSafeCast("int8", "bigint")).toBe(true);
        expect(isSafeCast("bool", "boolean")).toBe(true);
        expect(isSafeCast("float4", "real")).toBe(true);
        expect(isSafeCast("float8", "double precision")).toBe(true);
    });

    describe("varchar widening", () => {
        test("varchar(n) -> varchar(m) where m > n is safe", () => {
            expect(isSafeCast("varchar(50)", "varchar(100)")).toBe(true);
            expect(isSafeCast("varchar(1)", "varchar(255)")).toBe(true);
        });

        test("varchar(n) -> varchar(m) where m < n is unsafe", () => {
            expect(isSafeCast("varchar(100)", "varchar(50)")).toBe(false);
        });

        test("varchar(n) -> text is safe", () => {
            expect(isSafeCast("varchar(255)", "text")).toBe(true);
            expect(isSafeCast("varchar(1)", "text")).toBe(true);
        });

        test("varchar(n) -> varchar (unlimited) is safe", () => {
            expect(isSafeCast("varchar(255)", "varchar")).toBe(true);
        });

        test("character varying is normalised to varchar", () => {
            expect(isSafeCast("character varying(50)", "varchar(100)")).toBe(
                true,
            );
        });
    });

    describe("char widening", () => {
        test("char(n) -> char(m) where m > n is safe", () => {
            expect(isSafeCast("char(1)", "char(10)")).toBe(true);
        });

        test("char(n) -> char(m) where m < n is unsafe", () => {
            expect(isSafeCast("char(10)", "char(1)")).toBe(false);
        });
    });

    describe("integer widening", () => {
        test("smallint -> integer is safe", () => {
            expect(isSafeCast("smallint", "integer")).toBe(true);
        });

        test("smallint -> bigint is safe", () => {
            expect(isSafeCast("smallint", "bigint")).toBe(true);
        });

        test("integer -> bigint is safe", () => {
            expect(isSafeCast("integer", "bigint")).toBe(true);
        });

        test("bigint -> integer is unsafe", () => {
            expect(isSafeCast("bigint", "integer")).toBe(false);
        });

        test("integer -> smallint is unsafe", () => {
            expect(isSafeCast("integer", "smallint")).toBe(false);
        });

        test("aliases work for integer widening", () => {
            expect(isSafeCast("int2", "int4")).toBe(true);
            expect(isSafeCast("int4", "int8")).toBe(true);
            expect(isSafeCast("int", "bigint")).toBe(true);
        });
    });

    describe("numeric precision increase", () => {
        test("increasing precision and scale is safe", () => {
            expect(isSafeCast("numeric(5,2)", "numeric(10,4)")).toBe(true);
            expect(isSafeCast("numeric(5,2)", "numeric(5,2)")).toBe(true);
        });

        test("decreasing precision is unsafe", () => {
            expect(isSafeCast("numeric(10,4)", "numeric(5,2)")).toBe(false);
        });

        test("numeric(p,s) -> numeric (unlimited) is safe", () => {
            expect(isSafeCast("numeric(10,2)", "numeric")).toBe(true);
        });
    });

    describe("cidr -> inet", () => {
        test("cidr -> inet is safe", () => {
            expect(isSafeCast("cidr", "inet")).toBe(true);
        });

        test("inet -> cidr is unsafe", () => {
            expect(isSafeCast("inet", "cidr")).toBe(false);
        });
    });

    describe("unsafe casts", () => {
        test("text -> integer is unsafe", () => {
            expect(isSafeCast("text", "integer")).toBe(false);
        });

        test("integer -> text is unsafe", () => {
            expect(isSafeCast("integer", "text")).toBe(false);
        });

        test("varchar -> integer is unsafe", () => {
            expect(isSafeCast("varchar(255)", "integer")).toBe(false);
        });

        test("text -> varchar is unsafe", () => {
            expect(isSafeCast("text", "varchar(255)")).toBe(false);
        });

        test("timestamp -> date is unsafe", () => {
            expect(isSafeCast("timestamp", "date")).toBe(false);
        });
    });
});
