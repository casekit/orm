import { ModelDefinitions } from "../../schema/types/definitions/ModelDefinitions";
import { ModelName } from "../../schema/types/helpers/ModelName";
import { WhereClause } from "../types/WhereClause";

export type CountBuilder = {
    tableIndex: number;

    tables: {
        name: string;
        model: string;
        schema: string;
        alias: string;
        joins?: Join[];
        conditions?: WhereClause<ModelDefinitions, ModelName<ModelDefinitions>>;
        where?: WhereClause<ModelDefinitions, ModelName<ModelDefinitions>>;
    }[];
};

export type Join = {
    from: { table: string; columns: string[] };
    to: { table: string; columns: string[] };
};
