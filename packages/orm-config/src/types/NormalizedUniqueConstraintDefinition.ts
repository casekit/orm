import { SQLStatement } from "@casekit/sql";

export interface NormalizedUniqueConstraintDefinition {
    name: string;
    fields: string[];
    columns: string[];
    where: SQLStatement | null;
    nullsNotDistinct?: boolean;
}
