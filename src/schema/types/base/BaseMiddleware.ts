import { WhereClause } from "../../../queries/types/WhereClause";
import { ModelDefinitions } from "../definitions/ModelDefinitions";
import { BaseConfiguration } from "./BaseConfiguration";

export type BaseWhereMiddleware<
> = (
    config: BaseConfiguration,
    m: string,
    where?: WhereClause<ModelDefinitions, string>,
) => WhereClause<ModelDefinitions, string> | undefined;

export type BaseValuesMiddleware<
> = (
    config: BaseConfiguration,
    m: string,
    values?: Record<string, unknown | null>,
) => Record<string, unknown | null>;


export type BaseMiddleware = {
    find: {
        where: BaseWhereMiddleware;
    };
    update: {
        set: BaseValuesMiddleware;
        where: BaseWhereMiddleware;
    };
    create: {
        values: BaseValuesMiddleware;
    };
};
