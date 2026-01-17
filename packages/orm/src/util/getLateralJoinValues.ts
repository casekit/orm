import { isEqual, isNil, uniqWith } from "es-toolkit";
import { get } from "es-toolkit/compat";

export const getLateralJoinValues = (
    results: Record<string, unknown>[],
    path: string[],
    from: string[],
    to: string[],
) => {
    const all: Record<string, unknown>[] = results.flatMap((result) => {
        const parent =
            path.length === 0
                ? result
                : (get(result, path) as Record<string, unknown> | undefined);

        if (isNil(parent)) {
            // if the relation is a join from an optional N:1 relation of
            // the query's top level model, then the value being joined from
            // make not exist on the result. in that case we can't do a lateral
            // join so we ignore it.
            return [];
        }
        return [
            Object.fromEntries(to.map((f, index) => [f, parent[from[index]!]])),
        ];
    });

    const unique = uniqWith(all, isEqual);

    const values: Record<string, unknown[]> = Object.fromEntries(
        to.map((f) => [f, []]),
    );

    for (const v of unique) {
        for (const f of to) {
            values[f]!.push(v[f]);
        }
    }

    return to.map((f) => ({
        field: f,
        values: values[f] ?? [],
    }));
};
