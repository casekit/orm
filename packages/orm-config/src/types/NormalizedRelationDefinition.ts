export interface NormalizedOneToManyRelationDefinition {
    name: string;
    type: "1:N";
    model: string;
    table: string;
    from: {
        fields: string[];
        columns: string[];
    };
    to: {
        fields: string[];
        columns: string[];
    };
}

export interface NormalizedManyToManyRelationDefinition {
    name: string;
    type: "N:N";
    model: string;
    table: string;
    through: {
        model: string;
        table: string;
        fromRelation: string;
        toRelation: string;
    };
}

export interface NormalizedManyToOneRelationDefinition {
    name: string;
    type: "N:1";
    model: string;
    table: string;
    optional: boolean;
    from: {
        fields: string[];
        columns: string[];
    };
    to: {
        fields: string[];
        columns: string[];
    };
}

export type NormalizedRelationDefinition =
    | NormalizedOneToManyRelationDefinition
    | NormalizedManyToManyRelationDefinition
    | NormalizedManyToOneRelationDefinition;
