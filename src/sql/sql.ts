import { SQLStatement } from "./SQLStatement";

export const sql = (
    fragments: TemplateStringsArray,
    ...variables: readonly unknown[]
) => new SQLStatement(fragments, variables);
