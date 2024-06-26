import { BaseConfiguration } from "../../../schema/types/base/BaseConfiguration";
import { ModelName } from "../../../schema/types/helpers/ModelName";
import { LooseModelDefinitions } from "../../../schema/types/loose/LooseModelDefinitions";
import { SQLStatement, sql } from "../../../sql";
import { WhereClause } from "../WhereClause";
import { buildWhereClause } from "./buildWhereClause";
import { $and, $not, $or } from "./operators";

export const buildWhereClauses = (
    config: BaseConfiguration,
    table: { table: string; schema: string; alias: string; model: string },
    where: WhereClause<LooseModelDefinitions, ModelName<LooseModelDefinitions>>,
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

    if (where[$and]) {
        const subclauses = where[$and].map((condition) => {
            return buildWhereClauses(config, table, condition);
        });
        clauses.push(sql`(${sql.splat(subclauses, " AND ")})`);
    }

    if (where[$or]) {
        const subclauses = where[$or].map((condition) => {
            return buildWhereClauses(config, table, condition);
        });
        clauses.push(sql`(${sql.splat(subclauses, " OR ")})`);
    }

    if (where[$not]) {
        const subclauses = buildWhereClauses(config, table, where[$not]);
        clauses.push(sql`NOT ${subclauses}`);
    }

    return sql`(${sql.splat(clauses, " AND ")})`;
};
