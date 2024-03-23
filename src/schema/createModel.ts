import { DisallowExtraKeys } from "src/types/util/DisallowExtraKeys";

import { ModelDefinition } from "../types/schema/definition/ModelDefinition";

export const createModel = <Model extends ModelDefinition>(
    model: DisallowExtraKeys<ModelDefinition, Model>,
): Model => model;
