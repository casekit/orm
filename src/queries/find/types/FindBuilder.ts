import { ModelDefinitions } from "../../../schema/types/definitions/ModelDefinitions";
import { ModelName } from "../../../schema/types/helpers/ModelName";
import { WhereClause } from "../../clauses/WhereClause";

export type FindBuilder = {
    tableIndex: number;

    columns: {
        table: string;
        name: string;
        alias: string;
        path: string[];
    }[];

    tables: {
        name: string;
        model: string;
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
