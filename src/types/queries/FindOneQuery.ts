import { SchemaDefinition } from "../schema/definition/SchemaDefinition";
import { ModelName } from "../schema/helpers/ModelName";
import { SelectClause } from "./SelectClause";

export type FindOneQuery<S extends SchemaDefinition, M extends ModelName<S>> = {
    select: SelectClause<S, M>;
};
