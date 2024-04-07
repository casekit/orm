import { identity } from "lodash-es";
import { BaseConfiguration } from "src/types/schema/base/BaseConfiguration";
import { BaseModels } from "src/types/schema/base/BaseModels";

import { Configuration } from "../types/Configuration";
import { ModelDefinitions } from "../types/schema/definitions/ModelDefinitions";
import { RelationsDefinitions } from "../types/schema/definitions/RelationsDefinitions";
import { populateModel } from "./populateModel";

export const populateConfiguration = <
    Models extends ModelDefinitions,
    Relations extends RelationsDefinitions<Models>,
>(
    schema: Configuration<Models, Relations>,
): BaseConfiguration => {
    const base = {
        naming: {
            ...schema.naming,
            table: schema.naming?.table ?? identity,
            column: schema.naming?.column ?? identity,
        },
        schema: schema.schema ?? "public",
    };

    const models = Object.fromEntries(
        Object.entries(schema.models).map(([name, model]) => [
            name,
            populateModel(base, name, model),
        ]),
    ) as BaseModels;

    return {
        ...base,
        models,
        relations: schema.relations,
        extensions: schema.extensions ?? [],
        connection: schema.connection ?? {},
    } as BaseConfiguration;
};
