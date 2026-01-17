import { z } from "zod";

import { sql } from "@casekit/orm";

export const PrimaryKeySchema = z.object({
    schema: z.string(),
    table: z.string(),
    constraintName: z.string(),
    columns: z.array(z.string()),
});

export type PrimaryKey = z.infer<typeof PrimaryKeySchema>;

export const getPrimaryKeys = (schemas: string[]) =>
    sql(PrimaryKeySchema)`
        SELECT
            c.constraint_schema AS "schema",
            c.table_name AS "table",
            c.constraint_name AS "constraintName",
            array_agg(cc.column_name::text ORDER BY cc.ordinal_position) AS "columns"
        FROM
            information_schema.table_constraints c
            JOIN information_schema.key_column_usage cc ON c.constraint_name = cc.constraint_name
                AND c.constraint_schema = cc.constraint_schema
                AND c.table_name = cc.table_name
        WHERE
            c.constraint_type = 'PRIMARY KEY'
            AND c.constraint_schema IN (${schemas})
        GROUP BY
            c.constraint_schema,
            c.table_name,
            c.constraint_name
        ORDER BY
            c.constraint_schema,
            c.table_name
    `;
