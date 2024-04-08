import { set } from "lodash-es";

export type ColumnMapping = { path: string | string[]; alias: string };

export const rowToObject =
    (columns: ColumnMapping[]) =>
    (row: Record<string, unknown>): Record<string, unknown> => {
        return columns.reduce((acc, c) => set(acc, c.path, row[c.alias]), {});
    };
