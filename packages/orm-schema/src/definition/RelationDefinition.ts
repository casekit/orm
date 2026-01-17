export interface OneToManyRelationDefinition {
    type: "1:N";
    model: string;
    fromField: string | string[];
    toField: string | string[];
}

export interface ManyToOneRelationDefinition {
    type: "N:1";
    model: string;
    fromField: string | string[];
    toField: string | string[];
    optional?: boolean | null;
}

export interface ManyToManyRelationDefinition {
    type: "N:N";
    model: string;
    through: {
        model: string;
        fromRelation: string;
        toRelation: string;
    };
}

export type RelationDefinition =
    | OneToManyRelationDefinition
    | ManyToOneRelationDefinition
    | ManyToManyRelationDefinition;
