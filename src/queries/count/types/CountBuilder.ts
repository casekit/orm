import { ModelName } from "../../../schema/types/helpers/ModelName";
import { LooseModelDefinitions } from "../../../schema/types/loose/LooseModelDefinitions";
import { WhereClause } from "../../clauses/WhereClause";

export type CountBuilder = {
    tableIndex: number;

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
