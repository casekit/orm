import pgfmt from "pg-format";

import { SQLStatement } from "../..";
import { Model } from "../../types/schema";
import { UniqueConstraint } from "../../types/schema/definition/UniqueConstraint";

export const createUniqueConstraintSql = (
    model: Model,
    constraint: UniqueConstraint,
) => {
    const statement = new SQLStatement();
    statement.push(
        pgfmt(`CREATE UNIQUE INDEX ON %I.%I (`, model.schema, model.table),
    );
    statement.push(constraint.columns.map((c) => pgfmt("%I", c)).join(", "));
    statement.push(")");
    if (constraint.nullsNotDistinct) {
        statement.push(" NULLS NOT DISTINCT");
    }
    if (constraint.where) {
        statement.push(" WHERE (");
        statement.push(constraint.where);
        statement.push(")");
    }
    statement.push(";");
    return statement;
};
