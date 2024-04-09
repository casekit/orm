import pgfmt from "pg-format";

import { SQLStatement, sql } from "../../sql";
import { BaseConfiguration } from "../../types/base/BaseConfiguration";
import { WhereClause } from "../../types/queries/WhereClause";
import { ModelDefinitions } from "../../types/schema/definitions/ModelDefinitions";
import { ModelName } from "../../types/schema/helpers/ModelName";
import { interleave } from "../../util/interleave";
import { $and, $not, $or } from "./operators";

export const buildWhereClauses = (
    config: BaseConfiguration,
    table: string,
    where: WhereClause<ModelDefinitions, ModelName<ModelDefinitions>>,
): SQLStatement => {
    const clauses: SQLStatement[] = [];
    Object.entries(where).forEach(([column, value]) => {
        const clause = new SQLStatement();
        clause.push(pgfmt("%I.%I = ", table, column));
        clause.push(sql`${value}`);
        clauses.push(clause);
    });

    if ($and in where) {
        const clause = new SQLStatement();
        clause.push("(");
        clause.push(
            ...interleave(
                where[$and].map((condition) => {
                    return buildWhereClauses(config, table, condition);
                }),
                sql` AND `,
            ),
        );
        clause.push(")");
    }

    if ($or in where) {
        const clause = new SQLStatement();
        clause.push("(");
        clause.push(
            ...interleave(
                where[$or].map((condition) => {
                    return buildWhereClauses(config, table, condition);
                }),
                sql` OR `,
            ),
        );
        clause.push(")");
    }

    if ($not in where) {
        const clause = new SQLStatement();
        clause.push("NOT (");
        clause.push(buildWhereClauses(config, table, where[$not]));
        clause.push(")");
    }

    const combined = new SQLStatement();
    combined.push(...interleave(clauses, sql`\n    AND `));
    return combined;
};
