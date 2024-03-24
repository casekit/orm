import { groupBy } from "lodash-es";
import pg from "pg";

import { sql } from "../sql";
import { parseCreateUniqueIndexStatement } from "./parseCreateUniqueIndexStatement";
import { UniqueConstraint } from "./types/UniqueConstraint";

/**
 * Doing this with string manipulation in this way feels pretty hacky,
 * so it would be great if we can find a better way to do it.
 * In particular, this is likely to break if column names have parentheses in them.
 * Couldn't find a way to easily get the columns and conditions from the
 * information_schema * or pg_catalog tables though.
 */
export const getUniqueConstraints = async (
    client: pg.Client,
    schema: string,
): Promise<Record<string, UniqueConstraint[]>> => {
    const results = await client.query<{
        table: string;
        definition: string;
        name: string;
    }>(
        sql`select i.tablename as table, i.indexdef as definition, i.indexname as name
            from pg_indexes i
            left join pg_constraint c on i.indexname = c.conname and c.contype in ('p', 'x')
            where schemaname = ${schema}
            and c.conname is null
            and indexdef like 'CREATE UNIQUE INDEX%';
        `,
    );

    const parsed = results.rows.map((result) => ({
        ...result,
        ...parseCreateUniqueIndexStatement(result.definition),
    }));

    return groupBy(parsed, "table");
};
