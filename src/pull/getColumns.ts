import { groupBy } from "lodash";
import { Client } from "pg";
import { sql } from "~/sql/sql";

export const getColumns = async (client: Client, schema: string) => {
    const results = await client.query(
        sql`select
             c.table_name,
             c.column_name,
             c.ordinal_position,
             c.column_default,
             case when c.is_nullable = 'YES' then true else false end as is_nullable,
             c.data_type,
             e.data_type as element_data_type
             from information_schema.columns c
             left join information_schema.element_types e
             on c.table_catalog = e.object_catalog and c.table_schema = e.object_schema and e.collection_type_identifier = c.dtd_identifier and c.data_type = 'ARRAY'
             where table_schema = ${schema}`,
    );
    return groupBy(results.rows, "table_name");
};
