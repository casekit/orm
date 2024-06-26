import { uniq } from "lodash-es";
import { BaseConfiguration } from "src/schema/types/base/BaseConfiguration";
import { BaseModel } from "src/schema/types/base/BaseModel";

import { InvalidModelDefinitionError } from "../../errors";

export const validateModel = (
    _config: BaseConfiguration,
    name: string,
    model: BaseModel,
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
