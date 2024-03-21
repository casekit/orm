import { set } from "lodash";

import { QueryBuilder } from "./buildQuery";

export const rowToObject =
    (builder: Pick<QueryBuilder, "columns">) =>
    (row: Record<string, unknown>): Record<string, unknown> => {
        return builder.columns.reduce(
            (acc, c) => set(acc, c.path, row[c.alias]),
            {},
        );
    };
