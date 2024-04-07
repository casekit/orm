import { ModelDefinitions } from "../definitions/ModelDefinitions";
import { ColumnName } from "../helpers/ColumnName";
import { ModelName } from "../helpers/ModelName";

export type ManyToOneRelation<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
> = {
    [M2 in ModelName<Models>]: {
        model: M2;
        type: "N:1";
        foreignKey: ColumnName<Models, M> | ColumnName<Models, M>[];
    };
}[ModelName<Models>];
