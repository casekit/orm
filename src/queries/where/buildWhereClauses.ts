import { SQLStatement, sql } from "../../sql";
import { WhereClause } from "../../types/queries/WhereClause";
import { ModelDefinitions } from "../../types/schema/definitions/ModelDefinitions";
import { ModelName } from "../../types/schema/helpers/ModelName";
import { buildWhereClause } from "./buildWhereClause";
import { $and, $not, $or } from "./operators";

export const buildWhereClauses = (
    table: string,
    where: WhereClause<ModelDefinitions, ModelName<ModelDefinitions>>,
): SQLStatement => {
    const clauses: SQLStatement[] = [];
    Object.entries(where).forEach(([column, value]) => {
        clauses.push(buildWhereClause(table, column, value));
    });

    if ($and in where) {
        const subclauses = where[$and].map((condition) => {
            return buildWhereClauses(table, condition);
        });
        clauses.push(sql`(${sql.splat(subclauses, " AND ")})`);
    }

    if ($or in where) {
        const subclauses = where[$or].map((condition) => {
            return buildWhereClauses(table, condition);
        });
        clauses.push(sql`(${sql.splat(subclauses, " OR ")})`);
    }

    if ($not in where) {
        const subclauses = buildWhereClauses(table, where[$not]);
        clauses.push(sql`NOT ${subclauses}`);
    }

    return sql`(${sql.splat(clauses, " AND ")})`;
};
