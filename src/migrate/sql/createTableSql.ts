import pgfmt from "pg-format";
import { Model } from "~/types/schema";

export const createTableSql = (model: Model) => {
    const columns = Object.values(model.columns);
    const primaryKeys = columns.filter((c) => c.primaryKey);

    let sql = "";

    sql += pgfmt(
        "CREATE TABLE %I.%I (\n",
        model.schema ?? "public",
        model.table,
    );

    for (const column of columns) {
        sql += pgfmt(`    %I %s`, column.name, column.type);
        if (!column.nullable) sql += pgfmt(" NOT NULL");
        if (column.unique) sql += pgfmt(" UNIQUE");
        if (column.default !== null)
            sql += pgfmt(" DEFAULT %L", column.default);
        sql += pgfmt(",\n");
    }

    sql += pgfmt(
        `    PRIMARY KEY (${primaryKeys.map(() => "%I").join(", ")})`,
        ...primaryKeys.map((c) => c.name),
    );

    sql += pgfmt("\n);");

    return sql;
};
