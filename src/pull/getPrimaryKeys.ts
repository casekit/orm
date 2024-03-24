import { groupBy, mapValues, sortBy } from "lodash-es";
import pg from "pg";

import { sql } from "../sql";

export const getPrimaryKeys = async (client: pg.Client, schema: string) => {
    const results = await client.query(
        sql`select
             cc.table_name,
             cc.constraint_name,
             cc.column_name,
             cc.ordinal_position
             from information_schema.table_constraints c
             join information_schema.key_column_usage cc on c.constraint_name = cc.constraint_name and c.constraint_schema = cc.constraint_schema and c.table_name = cc.table_name
             where c.constraint_type = 'PRIMARY KEY'
             and c.constraint_schema = ${schema}`,
    );

    return mapValues(groupBy(results.rows, "table_name"), (columns) =>
        sortBy(columns, "ordinal_position").map((c) => c.column_name),
    );
};
