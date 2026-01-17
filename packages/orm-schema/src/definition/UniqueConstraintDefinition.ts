import { SQLStatement } from "@casekit/sql";

export interface UniqueConstraintDefinition {
    name?: string;
    fields: string[];
    where?: SQLStatement | null;
    nullsNotDistinct?: boolean;
}
