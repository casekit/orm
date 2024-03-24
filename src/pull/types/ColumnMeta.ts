export type ColumnMeta = {
    table: string;
    name: string;
    ordinal: number;
    default: string | null;
    nullable: boolean;
    type: string;
    elementtype: string;
    cardinality: number;
};
