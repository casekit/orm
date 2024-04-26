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

    table: {
        table: string;
        model: string;
        schema: string;
        alias: string;
        joins: Join[];
        conditions?: WhereClause<
            LooseModelDefinitions,
            ModelName<LooseModelDefinitions>
        >;
        where?: WhereClause<
            LooseModelDefinitions,
            ModelName<LooseModelDefinitions>
        >;
    };

    lateralBy?: {
        groupTable: string;
        itemTable: string;
        columns: {
            column: string;
            type: string;
            values: unknown[];
        }[];
    };

    for?: "update" | "no key update" | "share" | "key share";

    orderBy: {
        table: string;
        column: string;
        direction: "asc" | "desc";
    }[];

    limit?: number;

    offset?: number;
};
export type Join = {
    from: {
        schema: string;
        table: string;
        alias: string;
        model: string;
        columns: string[];
    };
    to: {
        schema: string;
        table: string;
        alias: string;
        model: string;
        columns: string[];
    };
    where?: WhereClause<
        LooseModelDefinitions,
        ModelName<LooseModelDefinitions>
    >;
    type?: "inner" | "left";
};
