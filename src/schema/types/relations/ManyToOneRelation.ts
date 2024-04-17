import { ColumnName } from "../helpers/ColumnName";
import { ModelName } from "../helpers/ModelName";
import { LooseModelDefinitions } from "../loose/LooseModelDefinitions";

export type ManyToOneRelation<
    Models extends LooseModelDefinitions,
    M extends ModelName<Models>,
> = {
    [M2 in ModelName<Models>]: {
        model: M2;
        type: "N:1";
        foreignKey: ColumnName<Models, M> | ColumnName<Models, M>[];
    };
}[ModelName<Models>];
