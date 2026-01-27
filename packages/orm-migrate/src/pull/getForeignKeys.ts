import { z } from "zod";

import { sql } from "@casekit/orm";

export const ForeignKeySchema = z.object({
    schema: z.string(),
    constraintName: z.string(),
    tableFrom: z.string(),
    columnsFrom: z.array(z.string()),
    tableTo: z.string(),
    columnsTo: z.array(z.string()),
    onUpdate: z.string().nullable(),
    onDelete: z.string().nullable(),
});

export type ForeignKey = z.infer<typeof ForeignKeySchema>;

export const getForeignKeys = (schemas: string[]) =>
    sql(ForeignKeySchema)`
        SELECT
            nspname AS "schema",
            conname AS "constraintName",
            table_from AS "tableFrom",
            array_agg(columns_from::text ORDER BY ordinality) AS "columnsFrom",
            table_to AS "tableTo",
            array_agg(columns_to::text ORDER BY ordinality) AS "columnsTo",
            CASE confupdtype
                WHEN 'r' THEN 'RESTRICT'
                WHEN 'c' THEN 'CASCADE'
                WHEN 'n' THEN 'SET NULL'
                WHEN 'd' THEN 'SET DEFAULT'
                ELSE NULL
            END AS "onUpdate",
            CASE confdeltype
                WHEN 'r' THEN 'RESTRICT'
                WHEN 'c' THEN 'CASCADE'
                WHEN 'n' THEN 'SET NULL'
                WHEN 'd' THEN 'SET DEFAULT'
                ELSE NULL
            END AS "onDelete"
        FROM (
            SELECT
                conname,
                c.relname AS table_from,
                a.attname AS columns_from,
                cf.relname AS table_to,
                af.attname AS columns_to,
                n.nspname,
                ss2.ordinality,
                ss2.confupdtype,
                ss2.confdeltype
            FROM
                pg_attribute AS af,
                pg_attribute AS a,
                pg_class c,
                pg_class cf,
                pg_namespace n,
                (
                    SELECT
                        conname,
                        conrelid,
                        confrelid,
                        conkey[i] AS conkey,
                        confkey[i] AS confkey,
                        i AS ordinality,
                        confupdtype,
                        confdeltype
                    FROM (
                        SELECT
                            conname,
                            conrelid,
                            confrelid,
                            conkey,
                            confkey,
                            confupdtype,
                            confdeltype,
                            generate_series(1, array_upper(conkey, 1)) AS i
                        FROM
                            pg_constraint
                        WHERE
                            contype = 'f') AS ss) AS ss2
                WHERE
                    af.attnum = confkey
                    AND af.attrelid = confrelid
                    AND a.attnum = conkey
                    AND a.attrelid = conrelid
                    AND a.attrelid = c.oid
                    AND af.attrelid = cf.oid
                    AND c.relnamespace = n.oid
                    AND n.nspname IN (${schemas})) AS ss3
        GROUP BY
            nspname,
            conname,
            table_to,
            table_from,
            confupdtype,
            confdeltype
        ORDER BY
            nspname,
            table_from,
            conname
    `;
