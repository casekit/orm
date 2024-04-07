import pgfmt from "pg-format";

import { SQLStatement } from "../..";
import { BaseModel } from "../../types/schema/BaseModel";
import { ForeignKey } from "../../types/schema/constraints/ForeignKey";

export const createForeignKeyConstraintSql = (
    model: BaseModel,
    constraint: ForeignKey,
) => {
    const statement = new SQLStatement();
    statement.push(
        pgfmt(`ALTER TABLE %I.%I ADD CONSTRAINT `, model.schema, model.table),
    );

    statement.push(
        pgfmt("%I", [model.table, ...constraint.columns, "fkey"].join("_")),
    );

    statement.push(pgfmt(` FOREIGN KEY (`, model.schema, model.table));
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
