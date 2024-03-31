import pgfmt from "pg-format";

import { SQLStatement } from "../../sql";
import { Model } from "../../types/schema";
import { interleave } from "../../util/interleave";

export const createTableSql = (model: Model): SQLStatement => {
    const columns = Object.values(model.columns);
    const primaryKey = model.primaryKey;

    const statement = new SQLStatement();

    statement.push(
        pgfmt("CREATE TABLE %I.%I (\n", model.schema ?? "public", model.table),
    );

    statement.push(
        ...interleave(
            columns.map((column) => {
                const definition = new SQLStatement(
                    pgfmt(`    %I %s`, column.name, column.type),
                );

                if (!column.nullable) definition.push(pgfmt(" NOT NULL"));

                if (column.default instanceof SQLStatement) {
                    definition.push(" DEFAULT ");
                    definition.push(column.default);
                } else if (
                    column.default !== null &&
                    column.default !== undefined
                ) {
                    definition.push(pgfmt(" DEFAULT %L", column.default));
                }
                return definition;
            }),
            ",\n",
        ),
    );

    if (primaryKey.length > 0) {
        statement.push(
            pgfmt(
                `,\n    PRIMARY KEY (${primaryKey.map(() => "%I").join(", ")})`,
                ...primaryKey,
            ),
        );
    }

    statement.push(pgfmt("\n);"));

    return statement;
};
