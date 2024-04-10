import { interleave } from "../util/interleave";
import { SQLStatement } from "./SQLStatement";

export const sql = (
    fragments: TemplateStringsArray,
    ...variables: readonly unknown[]
) => {
    /**
     * This complicated mess allows us to interpolate a SQLStatement
     * inside a SQLStatement, which is v helpful in eloquently
     * building up complex statements.
     */
    const expandedFragments: string[] = [];
    const expandedVariables: unknown[] = [];
    const remainingFragments = [...fragments];
    const remainingVariables = [...variables];
    let index = 0;

    while (remainingFragments.length > 0) {
        const fragment = remainingFragments.shift();
        const variable = remainingVariables.shift();
        expandedFragments[index] = (expandedFragments[index] ?? "") + fragment;
        if (remainingFragments.length > 0) {
            if (variable instanceof SQLStatement) {
                if (variable.fragments.length > 0) {
                    expandedFragments[index] += variable.fragments[0];
                    expandedFragments.push(...variable.fragments.slice(1));
                    expandedVariables.push(...variable.values);
                    index += variable.fragments.length - 1;
                }
            } else {
                expandedVariables.push(variable);
                index += 1;
            }
        }
    }

    return new SQLStatement(expandedFragments, expandedVariables);
};

sql.splat = <T>(values: T[], separator = `, `) =>
    values.length === 0
        ? sql`NULL`
        : new SQLStatement().push(
              ...interleave(
                  values.map((v) => sql`${v}`),
                  separator,
              ),
          );
