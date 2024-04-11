import pgfmt from "pg-format";

import { SQLStatement } from "../..";
import { BaseModel } from "../../schema/types/base/BaseModel";
import { UniqueConstraint } from "../../schema/types/constraints/UniqueConstraint";

export const createUniqueConstraintSql = (
    model: BaseModel,
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
