import { groupBy, mapValues, sortBy } from "lodash-es";
import pg from "pg";

import { sql } from "../../sql";
import { ColumnMeta } from "../types/ColumnMeta";

export const getTables = async (client: pg.Client, schema: string) => {
    const results = await client.query<ColumnMeta>(
        sql`WITH array_columns AS (
            	SELECT
            		ns.nspname AS schema,
            		(c.oid::regclass)::text AS table,
            		attname AS column,
            		attndims AS cardinality
            	FROM
            		pg_class c
            		JOIN pg_attribute a ON c.oid = attrelid
            		JOIN pg_type t ON t.oid = atttypid
            		JOIN pg_catalog.pg_namespace AS ns ON c.relnamespace = ns.oid
            	WHERE
            		a.attnum > 0
            )
            SELECT
            	c.table_name AS table,
            	c.column_name AS name,
            	c.ordinal_position AS ordinal,
            	c.column_default AS default,
            	CASE WHEN c.is_nullable = 'YES' THEN
            		TRUE
            	ELSE
            		FALSE
            	END AS nullable,
            	c.data_type AS type,
            	e.data_type AS elementtype,
            	coalesce(arr.cardinality, 0) AS cardinality
            FROM
            	information_schema.columns c
            	LEFT JOIN information_schema.element_types e ON c.table_catalog = e.object_catalog
            		AND c.table_schema = e.object_schema
            		AND e.collection_type_identifier = c.dtd_identifier
            		AND c.data_type = 'ARRAY'
            	LEFT JOIN array_columns arr ON arr.schema = c.table_schema
            		AND arr.table = c.table_name
            		AND arr.column = c.column_name
            WHERE
            	c.table_schema = ${schema}`,
    );
    return mapValues(groupBy(results.rows, "table"), (columns) =>
        sortBy(columns, "ordinal"),
    );
};
