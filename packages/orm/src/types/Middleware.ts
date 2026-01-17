import { NormalizedConfig } from "@casekit/orm-config";
import {
    ModelDefinition,
    ModelDefinitions,
    OperatorDefinitions,
} from "@casekit/orm-schema";

import { Orm } from "../orm.js";
import { CountParams } from "./CountParams.js";
import { CreateManyParams } from "./CreateManyParams.js";
import { CreateOneParams } from "./CreateOneParams.js";
import { CreateValues } from "./CreateValues.js";
import { DeleteParams } from "./DeleteParams.js";
import { FindParams } from "./FindParams.js";
import { UpdateParams } from "./UpdateParams.js";
import { UpdateValues } from "./UpdateValues.js";
import { WhereClause } from "./WhereClause.js";

export type WhereMiddleware = (
    config: NormalizedConfig,
    modelName: string,
    where: WhereClause<ModelDefinitions, OperatorDefinitions, string>,
) => WhereClause<ModelDefinitions, OperatorDefinitions, string>;

export type ValuesMiddleware = (
    config: NormalizedConfig,
    modelName: string,
    values: CreateValues<ModelDefinition>,
) => CreateValues<ModelDefinition>;

export type SetMiddleware = (
    config: NormalizedConfig,
    modelName: string,
    values: UpdateValues<ModelDefinition>,
) => UpdateValues<ModelDefinition>;

export type DeleteOneMiddleware = (
    db: Orm,
    modelName: string,
    params: DeleteParams<ModelDefinitions, OperatorDefinitions, string>,
) => Promise<Record<string, unknown> | number>;

export type DeleteManyMiddleware = (
    db: Orm,
    modelName: string,
    params: DeleteParams<ModelDefinitions, OperatorDefinitions, string>,
) => Promise<Record<string, unknown>[] | number>;

export type FindOneMiddleware = (
    db: Orm,
    modelName: string,
    query: FindParams<ModelDefinitions, OperatorDefinitions, string>,
) => Promise<Record<string, unknown>>;

export type FindManyMiddleware = (
    db: Orm,
    modelName: string,
    query: FindParams<ModelDefinitions, OperatorDefinitions, string>,
) => Promise<Readonly<Record<string, unknown>[]>>;

export type CountMiddleware = (
    db: Orm,
    modelName: string,
    query: CountParams<ModelDefinitions, OperatorDefinitions, string>,
) => Promise<number>;

export type CreateOneMiddleware = (
    db: Orm,
    modelName: string,
    query: CreateOneParams<ModelDefinitions, string>,
) => Promise<Record<string, unknown> | number>;

export type CreateManyMiddleware = (
    db: Orm,
    modelName: string,
    query: CreateManyParams<ModelDefinitions, string>,
) => Promise<Record<string, unknown>[] | number>;

export type UpdateOneMiddleware = (
    db: Orm,
    modelName: string,
    query: UpdateParams<ModelDefinitions, OperatorDefinitions, string>,
) => Promise<Record<string, unknown> | number | null>;

export type UpdateManyMiddleware = (
    db: Orm,
    modelName: string,
    query: UpdateParams<ModelDefinitions, OperatorDefinitions, string>,
) => Promise<Record<string, unknown>[] | number | null>;

export type Middleware = {
    name?: string;
    where?: WhereMiddleware;
    set?: SetMiddleware;
    values?: ValuesMiddleware;
    findOne?: FindOneMiddleware;
    findMany?: FindManyMiddleware;
    count?: CountMiddleware;
    createOne?: CreateOneMiddleware;
    createMany?: CreateManyMiddleware;
    updateOne?: UpdateOneMiddleware;
    updateMany?: UpdateManyMiddleware;
    deleteOne?: DeleteOneMiddleware;
    deleteMany?: DeleteManyMiddleware;
};