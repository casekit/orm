import pgfmt from "pg-format";
import { SQLStatement } from "~/sql/SQLStatement";
import { Model } from "~/types/schema";

export const createTableSql = (model: Model): SQLStatement => {
    const columns = Object.values(model.columns);
    const primaryKeys = columns.filter((c) => c.primaryKey);

    const statement = new SQLStatement();

    statement.push(
        pgfmt("CREATE TABLE %I.%I (\n", model.schema ?? "public", model.table),
    );

    for (const column of columns) {
        statement.push(pgfmt(`    %I %s`, column.name, column.type));

        if (!column.nullable) statement.push(pgfmt(" NOT NULL"));

        if (column.unique) statement.push(pgfmt(" UNIQUE"));

        if (column.default instanceof SQLStatement) {
            statement.push(" DEFAULT ");
            statement.push(column.default);
        } else if (column.default !== null && column.default !== undefined) {
            statement.push(pgfmt(" DEFAULT %L", column.default));
        }

        statement.push(pgfmt(",\n"));
    }

    statement.push(
        pgfmt(
            `    PRIMARY KEY (${primaryKeys.map(() => "%I").join(", ")})`,
            ...primaryKeys.map((c) => c.name),
        ),
    );

    statement.push(pgfmt("\n);"));

    return statement;
};
