import pgfmt from "pg-format";
import { SQLStatement } from "src";
import { Model } from "src/types/schema";

export const createUniqueConstraintSql = (
    model: Model,
    constraint: Model["constraints"]["unique"][0],
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
