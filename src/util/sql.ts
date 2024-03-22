import { SQLFragment } from "./SQLFragment";

export const sql = (
    fragments: TemplateStringsArray,
    ...variables: readonly unknown[]
) => new SQLFragment(fragments, variables);
