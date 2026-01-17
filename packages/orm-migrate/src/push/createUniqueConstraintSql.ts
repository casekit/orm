import { sql } from "@casekit/orm";
import {
    NormalizedModelDefinition,
    NormalizedUniqueConstraintDefinition,
} from "@casekit/orm-config";

export const createUniqueConstraintSql = (
    model: NormalizedModelDefinition,
    constraint: NormalizedUniqueConstraintDefinition,
) => {
    const statement = sql`
        CREATE UNIQUE INDEX ${sql.ident(constraint.name)}
        ON ${sql.ident(model.schema)}.${sql.ident(model.table)}
        (${sql.join(constraint.columns.map(sql.ident), ", ")})
`;

    if (constraint.nullsNotDistinct) {
        statement.append`
        NULLS NOT DISTINCT`;
    }

    if (constraint.where) {
        statement.append`
        WHERE ${constraint.where}`;
    }

    return statement;
};
