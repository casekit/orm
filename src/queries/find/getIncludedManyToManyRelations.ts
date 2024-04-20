import { BaseConfiguration } from "../../schema/types/base/BaseConfiguration";
import { BaseFindParams } from "./types/BaseFindParams";

export type ManyToManySubQuery = {
    model: string;
    name: string;
    relation: {
        model: string;
        type: "N:N";
        foreignKey: string | string[];
        otherKey: string | string[];
        through: string;
    };
    query: BaseFindParams;
    path: string[];
};

export const getIncludedManyToManyRelations = (
    config: BaseConfiguration,
    m: string,
    query: BaseFindParams,
    path: string[] = [],
) => {
    const rels = config.relations[m];
    const includedManyToManyRelations: ManyToManySubQuery[] = Object.entries(
        query.include ?? {},
    )
        .filter(([r, _]) => rels[r].type === "N:N")
        .map(([r, q]) => ({
            model: m,
            name: r,
            relation: rels[r] as ManyToManySubQuery["relation"],
            query: q!,
            path: [...path, r],
        }));

    const joinedManyToManyRelations: ManyToManySubQuery[] = Object.entries(
        query.include ?? {},
    )
        .filter(([r, _]) => rels[r].type === "N:1")
        .flatMap(([r, q]) =>
            getIncludedManyToManyRelations(config, rels[r].model, q!, [
                ...path,
                r,
            ]),
        );

    return [...includedManyToManyRelations, ...joinedManyToManyRelations];
};
