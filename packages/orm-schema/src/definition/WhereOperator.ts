import { SQLStatement } from "@casekit/sql";

export type WhereOperatorDefinition = (
    meta: { table: SQLStatement; column: SQLStatement },
    value: unknown,
) => SQLStatement;
