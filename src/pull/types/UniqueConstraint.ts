export type UniqueConstraint = {
    table: string;
    definition: string;
    name: string;
    columns: string[];
    where?: string;
    nullsNotDistinct?: boolean;
};
