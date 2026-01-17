import { z } from "zod";

import { sql } from "@casekit/orm";

export const UniqueConstraintSchema = z.object({
    schema: z.string(),
    table: z.string(),
    name: z.string(),
    definition: z.string(),
});

export type UniqueConstraint = z.infer<typeof UniqueConstraintSchema>;

export const getUniqueConstraints = (schemas: string[]) =>
    sql(UniqueConstraintSchema)`
        SELECT
            i.schemaname AS "schema",
            i.tablename AS "table",
            i.indexname AS "name",
            i.indexdef AS "definition"
        FROM
            pg_indexes i
            LEFT JOIN pg_constraint c ON i.indexname = c.conname
                AND c.contype IN ('p', 'x')
        WHERE
            i.schemaname IN (${schemas})
            AND c.conname IS NULL
            AND i.indexdef LIKE 'CREATE UNIQUE INDEX%'
        ORDER BY
            i.schemaname,
            i.tablename,
            i.indexname
    `;
