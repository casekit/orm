export interface ForeignKeyDefinition {
    name?: string;
    fields: Array<string>;
    references: {
        model: string;
        fields: string[];
    };
    onUpdate?: "RESTRICT" | "CASCADE" | "SET NULL" | "SET DEFAULT" | null;
    onDelete?: "RESTRICT" | "CASCADE" | "SET NULL" | "SET DEFAULT" | null;
}
