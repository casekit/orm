import { ModelName } from "../../../schema/types/helpers/ModelName";
import { LooseModelDefinitions } from "../../../schema/types/loose/LooseModelDefinitions";
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
        conditions?: WhereClause<
            LooseModelDefinitions,
            ModelName<LooseModelDefinitions>
        >;
        where?: WhereClause<
            LooseModelDefinitions,
            ModelName<LooseModelDefinitions>
        >;
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
