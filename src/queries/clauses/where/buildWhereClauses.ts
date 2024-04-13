import { BaseConfiguration } from "../../../schema/types/base/BaseConfiguration";
import { ModelDefinitions } from "../../../schema/types/definitions/ModelDefinitions";
import { ModelName } from "../../../schema/types/helpers/ModelName";
import { SQLStatement, sql } from "../../../sql";
import { WhereClause } from "../WhereClause";
import { buildWhereClause } from "./buildWhereClause";
import { $and, $not, $or } from "./operators";

export const buildWhereClauses = (
    config: BaseConfiguration,
    table: { name: string; schema: string; alias: string; model: string },
    where: WhereClause<ModelDefinitions, ModelName<ModelDefinitions>>,
): SQLStatement => {
    const clauses: SQLStatement[] = [];
    Object.entries(where).forEach(([column, value]) => {
        clauses.push(
            buildWhereClause(
                table.alias,
                config.models[table.model]["columns"][column]["name"],
                value,
            ),
        );
    });

    if ($and in where) {
        const subclauses = where[$and].map((condition) => {
            return buildWhereClauses(config, table, condition);
        });
        clauses.push(sql`(${sql.splat(subclauses, " AND ")})`);
    }

    if ($or in where) {
        const subclauses = where[$or].map((condition) => {
            return buildWhereClauses(config, table, condition);
        });
        clauses.push(sql`(${sql.splat(subclauses, " OR ")})`);
    }

    if ($not in where) {
        const subclauses = buildWhereClauses(config, table, where[$not]);
        clauses.push(sql`NOT ${subclauses}`);
    }

    return sql`(${sql.splat(clauses, " AND ")})`;
};
