import { expectTypeOf, test } from "vitest";

import { DefaultFieldType } from "./DefaultFieldType.js";

test("DefaultFieldType", () => {
    expectTypeOf<DefaultFieldType<"bigint">>().toBeBigInt();
    expectTypeOf<DefaultFieldType<"integer">>().toBeNumber();
    expectTypeOf<DefaultFieldType<"double precision">>().toBeNumber();
    expectTypeOf<DefaultFieldType<"oid">>().toBeNumber();
    expectTypeOf<DefaultFieldType<"real">>().toBeNumber();
    expectTypeOf<DefaultFieldType<"smallint">>().toBeNumber();
    expectTypeOf<DefaultFieldType<"smallserial">>().toBeNumber();
    expectTypeOf<DefaultFieldType<"serial">>().toBeNumber();
    expectTypeOf<DefaultFieldType<"text">>().toBeString();
    expectTypeOf<DefaultFieldType<"uuid">>().toBeString();
    expectTypeOf<DefaultFieldType<"bytea">>().toEqualTypeOf<Buffer>();
    // expectTypeOf<DefaultFieldType<"circle">>().toEqualTypeOf<{
    //     x: number;
    //     y: number;
    //     radius: number;
    // }>();
    // expectTypeOf<DefaultFieldType<"point">>().toEqualTypeOf<{
    //     x: number;
    //     y: number;
    // }>();
    expectTypeOf<DefaultFieldType<"json">>().toBeUnknown();
    expectTypeOf<DefaultFieldType<"jsonb">>().toBeUnknown();
    expectTypeOf<DefaultFieldType<"boolean">>().toBeBoolean();
    expectTypeOf<DefaultFieldType<"date">>().toEqualTypeOf<Date>();
    expectTypeOf<DefaultFieldType<"timestamp">>().toEqualTypeOf<Date>();
    // expectTypeOf<DefaultFieldType<"interval">>().toEqualTypeOf<{
    //     years?: number;
    //     months?: number;
    //     days?: number;
    //     hours?: number;
    //     minutes?: number;
    //     seconds?: number;
    //     milliseconds?: number;
    // }>();
    expectTypeOf<DefaultFieldType<"time">>().toEqualTypeOf<string>();
    expectTypeOf<DefaultFieldType<"timetz">>().toEqualTypeOf<string>();
    expectTypeOf<DefaultFieldType<"timestamptz">>().toEqualTypeOf<Date>();
    expectTypeOf<DefaultFieldType<"varchar">>().toBeString();
    expectTypeOf<DefaultFieldType<"char">>().toBeString();
    expectTypeOf<DefaultFieldType<"numeric">>().toBeString();
    expectTypeOf<DefaultFieldType<"decimal">>().toBeString();
    expectTypeOf<DefaultFieldType<"money">>().toBeString();
    expectTypeOf<DefaultFieldType<"bit">>().toBeString();
    expectTypeOf<DefaultFieldType<"box">>().toBeString();
    expectTypeOf<DefaultFieldType<"line">>().toBeString();
    expectTypeOf<DefaultFieldType<"lseg">>().toBeString();
    expectTypeOf<DefaultFieldType<"path">>().toBeString();
    expectTypeOf<DefaultFieldType<"polygon">>().toBeString();
    expectTypeOf<DefaultFieldType<"cidr">>().toBeString();
    expectTypeOf<DefaultFieldType<"inet">>().toBeString();
    expectTypeOf<DefaultFieldType<"macaddr">>().toBeString();
    expectTypeOf<DefaultFieldType<"tsquery">>().toBeString();
    expectTypeOf<DefaultFieldType<"tsvector">>().toBeString();
    expectTypeOf<DefaultFieldType<"xml">>().toBeString();
});
