import { set } from "es-toolkit/compat";

export type Column = {
    path: string[];
    alias: string;
};

export type Join = {
    path: string[];
};

export const rowToObject = (
    row: Record<string, unknown>,
    columns: Column[],
): Record<string, unknown> => {
    const obj: Record<string, unknown> = {};
    for (const c of columns) {
        if (row[c.alias] !== null) {
            set(obj, c.path, row[c.alias]);
        }
    }

    return obj;
};
