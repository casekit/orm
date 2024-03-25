import { groupBy, mapValues, sortBy } from "lodash-es";
import pg from "pg";

import { sql } from "../../sql";
import { PrimaryKey } from "../types/PrimaryKey";

export const getPrimaryKeys = async (
    client: pg.Client,
    schema: string,
): Promise<Record<string, string[]>> => {
    const results = await client.query<PrimaryKey>(
        sql`select
             cc.table_name as table,
             cc.constraint_name as name,
             cc.column_name as column,
             cc.ordinal_position as ordinal
             from information_schema.table_constraints c
             join information_schema.key_column_usage cc on c.constraint_name = cc.constraint_name and c.constraint_schema = cc.constraint_schema and c.table_name = cc.table_name
             where c.constraint_type = 'PRIMARY KEY'
             and c.constraint_schema = ${schema}`,
    );

    return mapValues(groupBy(results.rows, "table"), (columns) =>
        sortBy(columns, "ordinal").map((c) => c.column),
    );
};
