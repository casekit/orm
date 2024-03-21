import { ModelDefinition } from "~/types/schema/definition/ModelDefinition";

export const createModel = <Model extends ModelDefinition>(
    model: Model,
): Model => model;
