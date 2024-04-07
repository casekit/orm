import { ColumnName } from "../../helpers/ColumnName";
import { ModelName } from "../../helpers/ModelName";
import { ModelDefinitions } from "../ModelDefinitions";

export type ManyToManyRelation<Models extends ModelDefinitions> = {
    [M2 in ModelName<Models>]: {
        [J in ModelName<Models>]: {
            model: M2;
            through: J;
            type: "N:N";
            foreignKey: ColumnName<Models, J> | ColumnName<Models, J>[];
            otherKey: ColumnName<Models, J> | ColumnName<Models, J>[];
        };
    };
}[ModelName<Models>][ModelName<Models>];
