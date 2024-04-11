import { WhereClause } from "../../../queries/types/WhereClause";
import { ModelDefinitions } from "../definitions/ModelDefinitions";
import { ModelName } from "../helpers/ModelName";
import { BaseConfiguration } from "./BaseConfiguration";

export type BaseMiddleware = {
    find: {
        where: (
            config: BaseConfiguration,
            m: string,
            where?: WhereClause<ModelDefinitions, ModelName<ModelDefinitions>>,
        ) =>
            | WhereClause<ModelDefinitions, ModelName<ModelDefinitions>>
            | undefined;
    };
};
