import { WhereClause } from "../../../queries/clauses/WhereClause";
import { ModelDefinitions } from "../definitions/ModelDefinitions";
import { BaseConfiguration } from "./BaseConfiguration";

export type BaseWhereMiddleware = (
    where: WhereClause<ModelDefinitions, string> | undefined,
    meta: { config: BaseConfiguration; model: string },
) => WhereClause<ModelDefinitions, string> | undefined;

export type BaseValuesMiddleware = (
    values: Record<string, unknown | null> | undefined,
    meta: { config: BaseConfiguration; model: string },
) => Record<string, unknown | null>;

export type BaseMiddleware = {
    find: {
        where: BaseWhereMiddleware;
    };
    update: {
        values: BaseValuesMiddleware;
        where: BaseWhereMiddleware;
    };
    create: {
        values: BaseValuesMiddleware;
    };
    delete: {
        where: BaseWhereMiddleware;
    };
};
