import { WhereClause } from "../../types/queries/WhereClause";
import { ModelDefinitions } from "../../types/schema/definitions/ModelDefinitions";
import { ModelName } from "../../types/schema/helpers/ModelName";

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
        conditions?: WhereClause<ModelDefinitions, ModelName<ModelDefinitions>>;
        where?: WhereClause<ModelDefinitions, ModelName<ModelDefinitions>>;
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

    orderBy: {
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
