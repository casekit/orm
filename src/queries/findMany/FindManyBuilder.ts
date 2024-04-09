export type FindManyBuilder = {
    tableIndex: number;
    columns: {
        table: string;
        name: string;
        alias: string;
        path: string[];
    }[];
    tables: {
        name: string;
        schema: string;
        alias: string;
        joins?: Join[];
    }[];
    lateralBy?: {
        groupTable: string;
        itemTable: string;
        columns: {
            column: string;
            type: string;
            values: unknown[];
        }[];
    };

    ordering: {
        table: string;
        column: string;
        direction: "asc" | "desc";
    }[];

    limit?: number;

    offset?: number;
};
export type Join = {
    from: { table: string; columns: string[] };
    to: { table: string; columns: string[] };
};
