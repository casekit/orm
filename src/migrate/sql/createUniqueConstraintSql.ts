import pgfmt from "pg-format";

import { SQLStatement } from "../..";
import { Model } from "../../types/schema";

export const createUniqueConstraintSql = (
    model: Model,
    constraint: Model["uniqueConstraints"][0],
) => {
    const statement = new SQLStatement();
    statement.push(
        pgfmt(`CREATE UNIQUE INDEX ON %I.%I (`, model.schema, model.table),
    );
    statement.push(constraint.columns.map((c) => pgfmt("%I", c)).join(", "));
    statement.push(")");
    if (constraint.where) {
        statement.push(" WHERE (");
        statement.push(constraint.where);
        statement.push(")");
    }
    statement.push(";");
    return statement;
};
