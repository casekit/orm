import { uniq } from "lodash-es";

import { InvalidModelDefinitionError } from "../errors";
import { Model, Schema } from "../types/schema";

export const validateModel = (_schema: Schema, name: string, model: Model) => {
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

    if (columns.filter((c) => c.primaryKey).length === 0) {
        throw new InvalidModelDefinitionError("Model has no primary key", {
            model: [name, model],
        });
    }

    if (columns.filter((c) => c.primaryKey).length > 1) {
        throw new InvalidModelDefinitionError(
            "Composite primary keys are not yet supported",
            {
                model: [name, model],
            },
        );
    }
};
