import { z } from "zod";

import { sql } from "@casekit/orm";

export const UniqueConstraintSchema = z.object({
    schema: z.string(),
    table: z.string(),
    name: z.string(),
    columns: z.array(z.string()),
    definition: z.string(),
    nullsNotDistinct: z.boolean(),
});

export type UniqueConstraint = z.infer<typeof UniqueConstraintSchema>;

export const getUniqueConstraints = (schemas: string[]) =>
    sql(UniqueConstraintSchema)`
        SELECT
            i.schemaname AS "schema",
            i.tablename AS "table",
            i.indexname AS "name",
            array_agg(a.attname::text ORDER BY k.n) AS "columns",
            i.indexdef AS "definition",
            COALESCE(ix.indnullsnotdistinct, false) AS "nullsNotDistinct"
        FROM
            pg_indexes i
            LEFT JOIN pg_constraint c ON i.indexname = c.conname
                AND c.contype IN ('p', 'x')
            JOIN pg_class cl ON cl.relname = i.indexname
            JOIN pg_namespace ns ON ns.oid = cl.relnamespace
                AND ns.nspname = i.schemaname
            JOIN pg_index ix ON ix.indexrelid = cl.oid
            CROSS JOIN LATERAL unnest(ix.indkey) WITH ORDINALITY AS k(attnum, n)
            JOIN pg_attribute a ON a.attrelid = ix.indrelid
                AND a.attnum = k.attnum
        WHERE
            i.schemaname IN (${schemas})
            AND c.conname IS NULL
            AND i.indexdef LIKE 'CREATE UNIQUE INDEX%'
        GROUP BY
            i.schemaname,
            i.tablename,
            i.indexname,
            i.indexdef,
            ix.indnullsnotdistinct
        ORDER BY
            i.schemaname,
            i.tablename,
            i.indexname
    `;
