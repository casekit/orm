import { SQLStatement } from "@casekit/sql";

export type FindBuilder = {
    table: Table;
    columns: SelectedColumn[];
    joins: Join[];
    where?: SQLStatement | null;
    orderBy: OrderBy[];
    limit?: number;
    offset?: number;
    lateralBy?: LateralJoin;
    tableIndex: number;
    for?: "update" | "no key update" | "share" | "key share";
};

export type CountBuilder = {
    table: Table;
    joins: Join[];
    where?: SQLStatement | null;
    tableIndex: number;
    for?: "update" | "no key update" | "share" | "key share";
};

export type CreateBuilder = {
    table: Table;
    columns: string[];
    values: unknown[][];
    returning: ReturnedColumn[];
    onConflict?: ConflictAction;
};

export type UpdateBuilder = {
    table: Table;
    set: [column: string, value: unknown][];
    where: SQLStatement | null;
    returning: ReturnedColumn[];
};

export type DeleteBuilder = {
    table: Table;
    where: SQLStatement | null;
    returning: ReturnedColumn[];
};

export type Table = {
    schema: string;
    name: string;
    alias: string;
    model: string;
};

export type SelectedColumn = {
    table: string;
    name: string;
    alias: string;
    path: string[];
};

export type Column = {
    table: string;
    name: string;
};

export type OrderBy = {
    column: Column;
    direction: "ASC" | "DESC";
};

export type Join = {
    type: "LEFT" | "INNER";
    relation: string;
    table: Table;
    columns: { from: Column; to: Column }[];
    where?: SQLStatement | null;
    orderBy?: OrderBy[];
    path: string[];
    // For optional relations with nested joins, we need to wrap the nested
    // joins in a subquery to preserve the LEFT JOIN semantics
    subquery?: {
        alias: string; // Alias for the subquery (e.g., "b_subq")
        joins: Join[]; // Nested joins to put in the subquery
        columns: SelectedColumn[]; // Columns to SELECT from the subquery
    };
};

export type LateralJoin = {
    outerAlias: string;
    innerAlias: string;
    primaryKeys: {
        column: string;
        type: string;
        values: unknown[];
    }[];
};

export type ConflictAction = {
    do: "nothing";
};

export type ReturnedColumn = {
    name: string;
    alias: string;
    path: string[];
};
