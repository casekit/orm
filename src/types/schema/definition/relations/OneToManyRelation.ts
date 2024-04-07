import { ColumnName } from "../../helpers/ColumnName";
import { ModelName } from "../../helpers/ModelName";
import { ModelDefinitions } from "../ModelDefinitions";

export type OneToManyRelation<Models extends ModelDefinitions> = {
    [M2 in ModelName<Models>]: {
        model: M2;
        type: "1:N";
        foreignKey: ColumnName<Models, M2> | ColumnName<Models, M2>[];
    };
}[ModelName<Models>];
