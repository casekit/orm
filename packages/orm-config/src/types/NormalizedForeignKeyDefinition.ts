export interface NormalizedForeignKeyDefinition {
    name: string;
    fields: string[];
    columns: string[];
    references: {
        model: string;
        fields: string[];
        schema: string;
        table: string;
        columns: string[];
    };
    onUpdate: "RESTRICT" | "CASCADE" | "SET NULL" | "SET DEFAULT" | null;
    onDelete: "RESTRICT" | "CASCADE" | "SET NULL" | "SET DEFAULT" | null;
}
