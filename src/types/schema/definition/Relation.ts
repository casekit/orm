import { ColumnName } from "../helpers/ColumnName";
import { ModelName } from "../helpers/ModelName";
import { ModelDefinitions } from "./ModelDefinitions";

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

export type OneToManyRelation<Models extends ModelDefinitions> = {
    [M2 in ModelName<Models>]: {
        model: M2;
        type: "1:N";
        foreignKey: ColumnName<Models, M2> | ColumnName<Models, M2>[];
    };
}[ModelName<Models>];

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

export type Relation<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
> =
    | OneToManyRelation<Models>
    | ManyToOneRelation<Models, M>
    | ManyToManyRelation<Models>;

export type Relations<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
> = Record<string, Relation<Models, M>>;
