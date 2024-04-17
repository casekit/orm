import { ModelName } from "../../../schema/types/helpers/ModelName";
import { LooseModelDefinitions } from "../../../schema/types/loose/LooseModelDefinitions";
import { WhereClause } from "../../clauses/WhereClause";

export type CountBuilder = {
    tableIndex: number;

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
};

export type Join = {
    from: { table: string; columns: string[] };
    to: { table: string; columns: string[] };
};
