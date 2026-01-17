import pg from "pg";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";

import { defaultZodSchema } from "./defaultZodSchema.js";

describe("defaultZodSchema", () => {
    let db: pg.Client;

    beforeAll(async () => {
        db = new pg.Client();
        await db.connect();
    });

    afterEach(async () => {
        await db.query("ROLLBACK");
    });

    afterAll(async () => {
        await db.end();
    });

    test.for([
        ["char", "a", "a"],
        ["character", "a", "a"],
        ["character(24)", "abc", "abc                     "],
        ["character varying", "abc", "abc"],
        ["character varying(24)", "abc", "abc"],
        ["varchar", "abc", "abc"],
        ["bit", "1", "1"],
        ["bit", "0", "0"],
        ["bit(3)", "101", "101"],
        ["bit varying", "101", "101"],
        ["numeric", 123, "123"],
        ["numeric(5,2)", 123.45, "123.45"],
        ["numeric (5,2)", 123.45, "123.45"],
        ["integer", 42, 42],
        ["bigint", "9007199254740991", 9007199254740991n],
        ["double precision", 3.14159, 3.14159],
        ["real", 3.14, 3.14],
        ["text", "hello world", "hello world"],
        [
            "uuid",
            "123e4567-e89b-12d3-a456-426614174000",
            "123e4567-e89b-12d3-a456-426614174000",
        ],
        ["boolean", true, true],
        ["bpchar", "abc", "abc"],
        ["date", "2023-01-01", new Date("2023-01-01")],
        ["timetz", "13:45:30", "13:45:30+00"],
        ["timestamptz", "2023-01-01 13:45:30", new Date("2023-01-01T13:45:30")],
        ["time", "13:45:30", "13:45:30"],
        ["time(3)", "13:45:30", "13:45:30"],
        ["timestamp", "2023-01-01 13:45:30", new Date("2023-01-01T13:45:30")],
        [
            "timestamp(6)",
            "2023-01-01 13:45:30",
            new Date("2023-01-01T13:45:30"),
        ],
        // ["interval", "1 year 2 months", { months: 2, years: 1 }],
        // [
        //     "interval",
        //     "3 days 12 hours 7 minutes 2 seconds 555 milliseconds",
        //     {
        //         days: 3,
        //         hours: 12,
        //         minutes: 7,
        //         seconds: 2,
        //         milliseconds: 555,
        //     },
        // ],
        ["json", '{"key":"value"}', { key: "value" }],
        ["jsonb", '{"key":"value"}', { key: "value" }],
        // ["point", "(1,2)", { x: 1, y: 2 }],
        ["line", "{1,2,3}", "{1,2,3}"],
        ["lseg", "((1,2),(3,4))", "[(1,2),(3,4)]"],
        ["box", "(3,4),(1,2)", "(3,4),(1,2)"],
        ["polygon", "((1,2),(3,4),(5,6))", "((1,2),(3,4),(5,6))"],
        // ["circle", "<(1,2),3>", { x: 1, y: 2, radius: 3 }],
        ["cidr", "192.168.100.128/25", "192.168.100.128/25"],
        ["inet", "192.168.100.128", "192.168.100.128"],
        ["macaddr", "08:00:2b:01:02:03", "08:00:2b:01:02:03"],
        ["macaddr8", "08:00:2b:01:02:03:04:05", "08:00:2b:01:02:03:04:05"],
        ["bit varying(3)", "101", "101"],
        ["smallint", 32767, 32767],
        ["serial", undefined, 1],
        ["bigserial", undefined, 1n],
        ["smallserial", undefined, 1],
        ["money", 19.99, "$19.99"],
        [
            "timestamp with time zone",
            "2023-01-01 13:45:30+00",
            new Date("2023-01-01T13:45:30Z"),
        ],
        ["time with time zone", "13:45:30+00", "13:45:30+00"],
        ["bytea", Buffer.from("hello"), Buffer.from("hello")],
        ["xml", "<root>test</root>", "<root>test</root>"],
        ["path", "((1,2),(3,4),(5,6))", "((1,2),(3,4),(5,6))"],
        ["tsquery", "'fat' & 'rat'", "'fat' & 'rat'"],
        [
            "tsvector",
            "a fat cat sat on a mat",
            "'a' 'cat' 'fat' 'mat' 'on' 'sat'",
        ],
        ["int4range", "[1,4)", "[1,4)"],
        ["int8range", "[1,9223372036854775807)", "[1,9223372036854775807)"],
        ["numrange", "[1.123,4.456)", "[1.123,4.456)"],
        [
            "tsrange",
            "[2023-01-01 00:00:00,2023-01-02 00:00:00)",
            `["2023-01-01 00:00:00","2023-01-02 00:00:00")`,
        ],
        [
            "tstzrange",
            "[2023-01-01 00:00:00+00,2023-01-02 00:00:00+00)",
            `["2023-01-01 00:00:00+00","2023-01-02 00:00:00+00")`,
        ],
        ["daterange", "[2023-01-01,2023-01-02)", "[2023-01-01,2023-01-02)"],
        ["int2vector", "1 2 3", "1 2 3"],
        ["oid", "1234", 1234],
        ["pg_lsn", "0/1234567", "0/1234567"],
        ["regclass", "pg_class", "pg_class"],
        ["regnamespace", "pg_catalog", "pg_catalog"],
        ["regproc", "now", "now"],
        ["regprocedure", "sum(integer)", "sum(integer)"],
        ["regrole", "orm", "orm"],
        ["regtype", "integer", "integer"],
        ["tid", "(0,1)", "(0,1)"],
        ["xid", "1234", "1234"],
        ["txid_snapshot", "10:20:10,14,15", "10:20:10,14,15"],
        [
            "text[][][]",
            "{{{a,b},{c,d}},{{e,f},{g,h}}}",
            [
                [
                    ["a", "b"],
                    ["c", "d"],
                ],
                [
                    ["e", "f"],
                    ["g", "h"],
                ],
            ],
        ],
    ] as const)("%s columns", async ([datatype, value, expected = value]) => {
        await db.query("BEGIN TRANSACTION");
        await db.query(`CREATE TABLE foo (value ${datatype})`);

        if (datatype.endsWith("serial")) {
            await db.query("INSERT INTO foo DEFAULT VALUES");
        } else {
            await db.query(`INSERT INTO foo (value) VALUES ($1::${datatype})`, [
                value,
            ]);
        }

        const result = await db.query<{ value: unknown }>(`SELECT * FROM foo`);

        const parsed = defaultZodSchema(datatype).parse(result.rows[0]?.value);
        expect(parsed).toEqual(expected);
    });
});
