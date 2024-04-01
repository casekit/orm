import { groupBy } from "lodash-es";
import pg from "pg";

import { ForeignKey } from "../types/ForeignKey";

export const getForeignKeys = async (
    client: pg.Client,
    schema: string,
): Promise<Record<string, ForeignKey[]>> => {
    const result = await client.query<ForeignKey>(
        `
        SELECT
        	conname "constraintName",
        	table_from as "tableFrom",
        	array_agg(columns_from::text) AS "columnsFrom",
        	table_to AS "tableTo",
        	array_agg(columns_to::text) AS "columnsTo"
        FROM (
        	SELECT
        		conname,
        		conrelid::regclass AS table_from,
        		a.attname AS columns_from,
        		confrelid::regclass AS table_to,
        		af.attname AS columns_to
        	FROM
        		pg_attribute AS af,
        		pg_attribute AS a,
        		pg_class c,
        		pg_namespace n,
        		(
        			SELECT
        				conname,
        				conrelid,
        				confrelid,
        				conkey[i] AS conkey,
        				confkey[i] AS confkey
        			FROM (
        				SELECT
        					conname,
        					conrelid,
        					confrelid,
        					conkey,
        					confkey,
        					generate_series(1, array_upper(conkey, 1)) AS i
        				FROM
        					pg_constraint
        				WHERE
        					contype = 'f') AS ss) AS ss2
        		WHERE
        			af.attnum = confkey
        			AND af.attrelid = confrelid
        			AND a.attnum = conkey
        			AND a.attrelid = conrelid
        			AND af.attrelid = c.oid
        			AND c.relnamespace = n.oid
        			AND n.nspname = $1) AS ss3
        GROUP BY
        	conname,
        	table_to,
        	table_from;`,
        [schema],
    );
    return groupBy(result.rows, "tableFrom");
};
