import { ModelDefinitions } from "../schema/definitions/ModelDefinitions";
import { RelationsDefinitions } from "../schema/definitions/RelationsDefinitions";
import { ModelName } from "../schema/helpers/ModelName";

export type WhereClause<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
> = {};
