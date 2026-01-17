import { z } from "zod";

import { sql } from "@casekit/orm";

export const ColumnSchema = z.object({
    schema: z.string(),
    table: z.string(),
    column: z.string(),
    ordinalPosition: z.number().nullable(),
    type: z.string(),
    default: z.string().nullable(),
    nullable: z.boolean(),
    udtSchema: z.string(),
    udt: z.string(),
    elementType: z.string().nullable(),
    elementTypeSchema: z.string().nullable(),
    cardinality: z.number(),
    size: z.number().nullable(),
    isSerial: z.boolean(),
});

export type Column = z.infer<typeof ColumnSchema>;

export const getColumns = (schemas: string[]) =>
    sql(ColumnSchema)`
        SELECT
            c.table_schema AS "schema",
            c.table_name AS "table",
            c.column_name AS "column",
            c.ordinal_position AS "ordinalPosition",
            CASE 
                WHEN c.udt_name = 'int2vector' THEN 'int2vector'
                WHEN c.udt_name = 'oidvector' THEN 'oidvector'
                WHEN c.data_type = 'ARRAY' AND c.udt_name LIKE '\_int2vector' THEN 'int2vector[]'
                ELSE c.data_type
            END AS "type",
            c.column_default AS "default",
            c.is_nullable = 'YES' AS "nullable",
            c.udt_schema AS "udtSchema",
            c.udt_name AS "udt",
            e.data_type AS "elementType",
            e.udt_schema AS "elementTypeSchema",
            pa.attndims AS cardinality,
            c.character_maximum_length AS "size",
            COALESCE(seq_owned.is_serial, false) AS "isSerial"
        FROM
            information_schema.tables t
            JOIN information_schema.columns c ON t.table_name = c.table_name
                AND t.table_schema = c.table_schema
                AND t.table_catalog = c.table_catalog
            JOIN pg_catalog.pg_class pc ON pc.relname = c.table_name
            JOIN pg_catalog.pg_namespace pn ON pn.oid = pc.relnamespace
                AND pn.nspname = c.table_schema
            JOIN pg_catalog.pg_attribute pa ON pa.attrelid = pc.oid
                AND pa.attname = c.column_name
            LEFT JOIN information_schema.element_types e ON c.table_catalog = e.object_catalog
                AND c.table_schema = e.object_schema
                AND c.table_name = e.object_name
                AND e.object_type = 'TABLE'
                AND e.collection_type_identifier = c.dtd_identifier
                AND c.data_type = 'ARRAY'
            LEFT JOIN (
                SELECT 
                    pn.nspname AS schema_name,
                    pc.relname AS table_name,
                    pa.attname AS column_name,
                    true AS is_serial
                FROM 
                    pg_depend pd
                    JOIN pg_class pc ON pd.refobjid = pc.oid AND pc.relkind = 'r'
                    JOIN pg_attribute pa ON pd.refobjid = pa.attrelid AND pd.refobjsubid = pa.attnum
                    JOIN pg_namespace pn ON pc.relnamespace = pn.oid
                    JOIN pg_class seq ON pd.objid = seq.oid AND seq.relkind = 'S'
                WHERE 
                    pd.deptype = 'a'
                    AND pd.classid = 'pg_class'::regclass
                    AND pd.refclassid = 'pg_class'::regclass
                    AND pn.nspname IN (${schemas})
            ) seq_owned ON seq_owned.schema_name = c.table_schema 
                AND seq_owned.table_name = c.table_name 
                AND seq_owned.column_name = c.column_name
        WHERE
            t.table_schema IN (${schemas})
            AND t.table_type = 'BASE TABLE'
            AND pa.attnum > 0
        ORDER BY
            t.table_name,
            c.ordinal_position
    `;
