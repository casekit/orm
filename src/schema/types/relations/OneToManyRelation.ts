import { ColumnName } from "../helpers/ColumnName";
import { ModelName } from "../helpers/ModelName";
import { LooseModelDefinitions } from "../loose/LooseModelDefinitions";

export type OneToManyRelation<Models extends LooseModelDefinitions> = {
    [M2 in ModelName<Models>]: {
        model: M2;
        type: "1:N";
        foreignKey: ColumnName<Models, M2> | ColumnName<Models, M2>[];
        optional?: boolean;
    };
}[ModelName<Models>];
