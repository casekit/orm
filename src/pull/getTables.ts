import { groupBy, mapValues, sortBy } from "lodash";
import { Client } from "pg";

import { sql } from "../sql";
import { ColumnMeta } from "./ColumnMeta";

export const getTables = async (client: Client, schema: string) => {
    const results = await client.query<ColumnMeta>(
        sql`select
             c.table_name as table,
             c.column_name as name,
             c.ordinal_position as ordinal,
             c.column_default as default,
             case when c.is_nullable = 'YES' then true else false end as nullable,
             c.data_type as type,
             e.data_type as elementType
             from information_schema.columns c
             left join information_schema.element_types e
             on c.table_catalog = e.object_catalog and c.table_schema = e.object_schema and e.collection_type_identifier = c.dtd_identifier and c.data_type = 'ARRAY'
             where table_schema = ${schema}`,
    );
    return mapValues(groupBy(results.rows, "table"), (columns) =>
        sortBy(columns, "ordinal"),
    );
};
