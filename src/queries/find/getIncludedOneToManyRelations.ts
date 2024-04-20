import { BaseConfiguration } from "../../schema/types/base/BaseConfiguration";
import { BaseRelation } from "../../schema/types/base/BaseRelation";
import { BaseFindParams } from "./types/BaseFindParams";

export type OneToManySubQuery = {
    model: string;
    name: string;
    relation: BaseRelation;
    query: BaseFindParams;
    path: string[];
};

export const getIncludedOneToManyRelations = (
    config: BaseConfiguration,
    m: string,
    query: BaseFindParams,
    path: string[] = [],
) => {
    const rels = config.relations[m];
    const includedOneToManyRelations: OneToManySubQuery[] = Object.entries(
        query.include ?? {},
    )
        .filter(([r, _]) => rels[r].type === "1:N")
        .map(([r, q]) => ({
            model: m,
            name: r,
            relation: rels[r],
            query: q!,
            path: [...path, r],
        }));

    const joinedOneToManyRelations: OneToManySubQuery[] = Object.entries(
        query.include ?? {},
    )
        .filter(([r, _]) => rels[r].type === "N:1")
        .flatMap(([r, q]) =>
            getIncludedOneToManyRelations(config, rels[r].model, q!, [
                ...path,
                r,
            ]),
        );

    return [...includedOneToManyRelations, ...joinedOneToManyRelations];
};
