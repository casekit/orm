import pgfmt from "pg-format";

import { OrmError } from "../../errors";
import { BaseConfiguration } from "../../schema/types/base/BaseConfiguration";
import { SQLStatement, sql } from "../../sql";
import { buildWhereClauses } from "../clauses/where/buildWhereClauses";
import { hasConditions } from "../util/hasConditions";
import { DeleteBuilder } from "./buildDelete";

export const deleteToSql = (
    config: BaseConfiguration,
    m: string,
    builder: DeleteBuilder,
): SQLStatement => {
    const { table, where, returning } = builder;

    const frag = sql`DELETE FROM %I.%I AS %I`.withIdentifiers(
        table.schema,
        table.table,
        table.alias,
    );

    if (!hasConditions(where)) {
        throw new OrmError(`No where clause provided for delete`, {
            data: {
                table,
                where,
                returning,
            },
        });
    }
    frag.push("\nWHERE\n    ");
    frag.push(buildWhereClauses(config, table, where));

    if (returning.length > 0) {
        frag.push("\nRETURNING\n");
        frag.push(
            returning
                .map((r) =>
                    pgfmt(`    %I.%I as %I`, table.alias, r.name, r.alias),
                )
                .join(",\n"),
        );
    }
    frag.push(";\n");

    return frag;
};
