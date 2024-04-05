import { ModelDefinitions } from "../../../types/schema/definition/ModelDefinitions";
import { ColumnName } from "../../../types/schema/helpers/ColumnName";
import { ModelName } from "../../../types/schema/helpers/ModelName";
import { type Models } from "../models";

type ManyToOneRelation<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
> = {
    [M2 in ModelName<Models>]: {
        model: M2;
        type: "N:1";
        join: { on: ColumnName<Models, M>; to?: ColumnName<Models, M2> };
    };
}[ModelName<Models>];

type OneToManyRelation<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
> = {
    [M2 in ModelName<Models>]: {
        model: M2;
        type: "1:N";
        join: { on: ColumnName<Models, M2>; from?: ColumnName<Models, M> };
    };
}[ModelName<Models>];

type ManyToManyRelation<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
> = {
    [M2 in ModelName<Models>]: {
        [J in ModelName<Models>]: {
            model: M2;
            through: J;
            type: "N:N";
            join: { from: ColumnName<Models, M>; to?: ColumnName<Models, M2> };
        };
    };
}[ModelName<Models>][ModelName<Models>];

type Relation<Models extends ModelDefinitions, M extends ModelName<Models>> =
    | OneToManyRelation<Models, M>
    | ManyToOneRelation<Models, M>
    | ManyToManyRelation<Models, M>;

type Relations<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
> = Record<string, Relation<Models, M>>;

export default {
    author: {
        model: "user",
        type: "N:1",
        join: { on: "authorId" },
    },
    // moreByTheSameAuthor: {
    //     model: "post",
    //     through: "user",
    //     type: "N:N",
    //     join: { on: "authorId", via: to: "id" },
    // },
} satisfies Relations<Models, "post">;
