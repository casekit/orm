import { SQLStatement, sql } from "@casekit/orm";
import {
    NormalizedForeignKeyDefinition,
    NormalizedModelDefinition,
} from "@casekit/orm-config";

export const createForeignKeyConstraintSql = (
    model: NormalizedModelDefinition,
    fk: NormalizedForeignKeyDefinition,
) => {
    const statement = sql`
        ALTER TABLE ${sql.ident(model.schema)}.${sql.ident(model.table)}
        ADD CONSTRAINT ${sql.ident(fk.name)}
        FOREIGN KEY (${sql.join(fk.columns.map(sql.ident), ", ")})
        REFERENCES ${sql.ident(fk.references.schema)}.${sql.ident(fk.references.table)} (${sql.join(fk.references.columns.map(sql.ident), ", ")})`;

    if (fk.onDelete) {
        statement.append`
        ON DELETE ${new SQLStatement(fk.onDelete)}`;
    }

    if (fk.onUpdate) {
        statement.append`
        ON UPDATE ${new SQLStatement(fk.onUpdate)}`;
    }

    return statement;
};
