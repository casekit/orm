import pgfmt from "pg-format";

import { SQLStatement } from "../..";
import { Model } from "../../types/schema";
import { ForeignKey } from "../../types/schema/definition/ForeignKey";

export const createForeignKeyConstraintSql = (
    model: Model,
    constraint: ForeignKey,
) => {
    const statement = new SQLStatement();
    statement.push(
        pgfmt(
            `ALTER TABLE %I.%I ADD CONSTRAINT FOREIGN KEY (`,
            model.schema,
            model.table,
        ),
    );
    statement.push(constraint.columns.map((c) => pgfmt("%I", c)).join(", "));
    statement.push(")");
    statement.push(
        pgfmt(
            ` REFERENCES %I.%I (`,
            constraint.references.schema,
            constraint.references.table,
        ),
    );
    statement.push(
        constraint.references.columns.map((c) => pgfmt("%I", c)).join(", "),
    );
    statement.push(")");
    if (constraint.onDelete) {
        statement.push(` ON DELETE `);
        statement.push(constraint.onDelete);
    }
    if (constraint.onUpdate) {
        statement.push(` ON UPDATE `);
        statement.push(constraint.onUpdate);
    }
    statement.push(";");
    return statement;
};
