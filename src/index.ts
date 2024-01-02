import { Orm } from "./orm";
import { Config } from "./types/Config";
import { ModelDefinition } from "./types/schema/definition/ModelDefinition";
import { SchemaDefinition } from "./types/schema/definition/SchemaDefinition";

export const createConfig = <C extends Config>(config: C): C => config;

export const createModel = <Model extends ModelDefinition>(
    model: Model,
): Model => model;

export const orm = <S extends SchemaDefinition>(schema: S): Orm<S> =>
    new Orm<S>(schema);
