import pgfmt from "pg-format";
import { Model } from "~/types/schema";
import { SQLFragment } from "~/util/SqlFragment";

export const createTableSql = (model: Model): SQLFragment => {
    const columns = Object.values(model.columns);
    const primaryKeys = columns.filter((c) => c.primaryKey);

    const sql = new SQLFragment();

    sql.push(
        pgfmt("CREATE TABLE %I.%I (\n", model.schema ?? "public", model.table),
    );

    for (const column of columns) {
        sql.push(pgfmt(`    %I %s`, column.name, column.type));

        if (!column.nullable) sql.push(pgfmt(" NOT NULL"));

        if (column.unique) sql.push(pgfmt(" UNIQUE"));

        if (column.default instanceof SQLFragment) {
            sql.push(" DEFAULT ");
            sql.push(column.default);
        } else if (column.default !== null && column.default !== undefined) {
            sql.push(pgfmt(" DEFAULT %L", column.default));
        }

        sql.push(pgfmt(",\n"));
    }

    sql.push(
        pgfmt(
            `    PRIMARY KEY (${primaryKeys.map(() => "%I").join(", ")})`,
            ...primaryKeys.map((c) => c.name),
        ),
    );

    sql.push(pgfmt("\n);"));

    return sql;
};
