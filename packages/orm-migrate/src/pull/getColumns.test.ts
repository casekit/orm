import {
    afterAll,
    afterEach,
    beforeAll,
    beforeEach,
    describe,
    expect,
    test,
} from "vitest";

import { SQLStatement, orm, sql } from "@casekit/orm";

import { getColumns } from "./getColumns.js";

describe("getColumns", () => {
    const db = orm({
        schema: "migrate-get-tables-test",
        models: {},
    });

    beforeAll(async () => {
        await db.connect();
    });

    afterAll(async () => {
        await db.close();
    });

    beforeEach(async () => {
        await db.query`DROP SCHEMA IF EXISTS "migrate-get-tables-test" CASCADE;`;
        await db.query`CREATE SCHEMA IF NOT EXISTS "migrate-get-tables-test";`;
    });

    afterEach(async () => {
        await db.query`DROP SCHEMA IF EXISTS "migrate-get-tables-test" CASCADE;`;
    });

    test("with an empty database it returns no tables or columns", async () => {
        const statement = getColumns(["migrate-get-tables-test"]);
        const result = await db.query(statement);
        expect(result).toEqual([]);
    });

    test.for<
        [
            string,
            SQLStatement,
            Array<ReturnType<typeof expect.objectContaining>>,
        ]
    >([
        [
            "handles uuid columns",
            sql`
                CREATE TABLE "migrate-get-tables-test"."uuid_test" (
                    "uuid_col" UUID DEFAULT gen_random_uuid(),
                    "uuid_col_notnull" UUID NOT NULL
                );
            `,
            [
                expect.objectContaining({
                    type: "uuid",
                    default: "gen_random_uuid()",
                    nullable: true,
                }),
                expect.objectContaining({
                    type: "uuid",
                    nullable: false,
                }),
            ],
        ],
        [
            "handles serial columns",
            sql`
                CREATE TABLE "migrate-get-tables-test"."serial_test" (
                    "smallserial_col" SMALLSERIAL,
                    "serial_col" SERIAL,
                    "bigserial_col" BIGSERIAL
                );
            `,
            [
                expect.objectContaining({
                    type: "smallint",
                    default: expect.stringContaining("nextval"),
                    nullable: false,
                    isSerial: true,
                }),
                expect.objectContaining({
                    type: "integer",
                    default: expect.stringContaining("nextval"),
                    nullable: false,
                    isSerial: true,
                }),
                expect.objectContaining({
                    type: "bigint",
                    default: expect.stringContaining("nextval"),
                    nullable: false,
                    isSerial: true,
                }),
            ],
        ],
        [
            "handles boolean columns",
            sql`
                CREATE TABLE "migrate-get-tables-test"."boolean_test" (
                    "bool_col" BOOLEAN DEFAULT true
                );
            `,
            [
                expect.objectContaining({
                    type: "boolean",
                    default: "true",
                }),
            ],
        ],
        [
            "handles numeric columns",
            sql`
                CREATE TABLE "migrate-get-tables-test"."numeric_test" (
                    "numeric_col" NUMERIC(10,2)
                );
            `,
            [
                expect.objectContaining({
                    type: "numeric",
                    udt: "numeric",
                }),
            ],
        ],
        [
            "handles various numeric and decimal types",
            sql`
                CREATE TABLE "migrate-get-tables-test"."number_test" (
                    "smallint_col" SMALLINT,
                    "integer_col" INTEGER,
                    "bigint_col" BIGINT,
                    "decimal_col" DECIMAL(10,2),
                    "real_col" REAL,
                    "double_col" DOUBLE PRECISION
                );
            `,
            [
                expect.objectContaining({ type: "smallint", udt: "int2" }),
                expect.objectContaining({ type: "integer", udt: "int4" }),
                expect.objectContaining({ type: "bigint", udt: "int8" }),
                expect.objectContaining({ type: "numeric", udt: "numeric" }),
                expect.objectContaining({ type: "real", udt: "float4" }),
                expect.objectContaining({
                    type: "double precision",
                    udt: "float8",
                }),
            ],
        ],
        [
            "handles character types",
            sql`
                CREATE TABLE "migrate-get-tables-test"."char_test" (
                    "char_col" CHAR(10),
                    "varchar_col" VARCHAR(50),
                    "text_col" TEXT,
                    "name_col" NAME
                );
            `,
            [
                expect.objectContaining({ type: "character", size: 10 }),
                expect.objectContaining({
                    type: "character varying",
                    size: 50,
                }),
                expect.objectContaining({ type: "text" }),
                expect.objectContaining({ type: "name" }),
            ],
        ],
        [
            "handles date and time types",
            sql`
                CREATE TABLE "migrate-get-tables-test"."datetime_test" (
                    "date_col" DATE,
                    "time_col" TIME,
                    "timetz_col" TIME WITH TIME ZONE,
                    "timestamp_col" TIMESTAMP,
                    "timestamptz_col" TIMESTAMP WITH TIME ZONE,
                    "interval_col" INTERVAL
                );
            `,
            [
                expect.objectContaining({ type: "date" }),
                expect.objectContaining({ type: "time without time zone" }),
                expect.objectContaining({ type: "time with time zone" }),
                expect.objectContaining({
                    type: "timestamp without time zone",
                }),
                expect.objectContaining({ type: "timestamp with time zone" }),
                expect.objectContaining({ type: "interval" }),
            ],
        ],
        [
            "handles array columns",
            sql`
                CREATE TABLE "migrate-get-tables-test"."array_test" (
                    "array_col" INTEGER[]
                );
            `,
            [
                expect.objectContaining({
                    type: "ARRAY",
                    elementType: "integer",
                    cardinality: 1,
                }),
            ],
        ],
        [
            "handles multi-dimensional array columns",
            sql`
                CREATE TABLE "migrate-get-tables-test"."array_test" (
                    "multi_dim_array_col" TEXT[][][] NOT NULL DEFAULT ARRAY[ARRAY[ARRAY['a']]]
                );
            `,
            [
                expect.objectContaining({
                    type: "ARRAY",
                    elementType: "text",
                    cardinality: 3,
                    nullable: false,
                    default: "ARRAY[ARRAY[ARRAY['a'::text]]]",
                }),
            ],
        ],
        [
            "handles json columns",
            sql`
                CREATE TABLE "migrate-get-tables-test"."json_test" (
                    "json_col" JSON
                );
            `,
            [
                expect.objectContaining({
                    type: "json",
                }),
            ],
        ],
        [
            "handles enum columns",
            sql`
                CREATE TYPE "migrate-get-tables-test"."mood" AS ENUM ('happy', 'sad');
                CREATE TABLE "migrate-get-tables-test"."enum_test" (
                    "enum_col" "migrate-get-tables-test"."mood"
                );
            `,
            [
                expect.objectContaining({
                    type: "USER-DEFINED",
                    udtSchema: "migrate-get-tables-test",
                    udt: "mood",
                }),
            ],
        ],
        [
            "handles composite type columns",
            sql`
                CREATE TYPE "migrate-get-tables-test"."complex" AS (x double precision, y double precision);
                CREATE TABLE "migrate-get-tables-test"."composite_test" (
                    "complex_col" "migrate-get-tables-test"."complex"
                );
            `,
            [
                expect.objectContaining({
                    type: "USER-DEFINED",
                    udtSchema: "migrate-get-tables-test",
                    udt: "complex",
                }),
            ],
        ],
        [
            "handles currency columns",
            sql`
                CREATE TABLE "migrate-get-tables-test"."currency_test" (
                    "money_col" MONEY DEFAULT 42.42
                );
            `,
            [
                expect.objectContaining({
                    type: "money",
                    default: "42.42",
                }),
            ],
        ],
        [
            "handles geometric columns",
            sql`
                CREATE TABLE "migrate-get-tables-test"."geometry_test" (
                    "point_col" POINT,
                    "line_col" LINE,
                    "polygon_col" POLYGON
                );
            `,
            [
                expect.objectContaining({ type: "point" }),
                expect.objectContaining({ type: "line" }),
                expect.objectContaining({ type: "polygon" }),
            ],
        ],
        [
            "handles network address columns",
            sql`
                CREATE TABLE "migrate-get-tables-test"."network_test" (
                    "inet_col" INET,
                    "cidr_col" CIDR,
                    "macaddr_col" MACADDR
                );
            `,
            [
                expect.objectContaining({ type: "inet" }),
                expect.objectContaining({ type: "cidr" }),
                expect.objectContaining({ type: "macaddr" }),
            ],
        ],
        [
            "handles sql now() default values correctly",
            sql`
                CREATE TABLE "migrate-get-tables-test"."timestamp_defaults_test" (
                    "created_at" TIMESTAMP DEFAULT now(),
                    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
                );
            `,
            [
                expect.objectContaining({
                    type: "timestamp without time zone",
                    default: "now()",
                }),
                expect.objectContaining({
                    type: "timestamp with time zone",
                    default: "now()",
                }),
            ],
        ],
    ])("%s", async ([_, query, expected]) => {
        await db.transact(
            async (db) => {
                await db.query(query);

                const result = await db.query(
                    getColumns(["migrate-get-tables-test"]),
                );

                expect(result).toEqual(expected);
            },
            { rollback: true },
        );
    });
});
