import { z } from "zod";

import { sql } from "@casekit/orm";

export const ExtensionSchema = z.object({
    name: z.string(),
    schema: z.string(),
});

export type Extension = z.infer<typeof ExtensionSchema>;

/**
 * Get all extensions installed in the specified schemas.
 */
export const getExtensions = (schemas: string[]) =>
    sql(ExtensionSchema)`
        SELECT
            e.extname AS "name",
            n.nspname AS "schema"
        FROM
            pg_extension e
            JOIN pg_namespace n ON e.extnamespace = n.oid
        WHERE
            n.nspname IN (${schemas})
        ORDER BY
            n.nspname,
            e.extname
    `;
