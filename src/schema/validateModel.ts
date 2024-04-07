import { uniq } from "lodash-es";

import { ModelDefinition } from "..";
import { InvalidModelDefinitionError } from "../errors";
import { PopulatedModel, PopulatedSchema } from "../types/schema";
import { ModelDefinitions } from "../types/schema/definition/ModelDefinitions";

export const validateModel = <Models extends ModelDefinitions>(
    _schema: PopulatedSchema<Models>,
    name: string,
    model: PopulatedModel<ModelDefinition>,
) => {
    const columns = Object.values(model.columns);

    if (model.table === "") {
        throw new InvalidModelDefinitionError("Model has empty table name", {
            model: [name, model],
        });
    }

    if (columns.length === 0) {
        throw new InvalidModelDefinitionError("Model has no columns", {
            model: [name, model],
        });
    }

    if (uniq(columns.map((c) => c.name)).length < columns.length) {
        throw new InvalidModelDefinitionError(
            "Model has two columns with the same name",
            { model: [name, model] },
        );
    }
};
