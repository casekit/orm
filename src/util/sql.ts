import { SQLFragment } from "./SqlFragment";

export const sql = (
    fragments: TemplateStringsArray,
    ...variables: readonly unknown[]
) => new SQLFragment(fragments, variables);
