import { BaseColumn } from "./BaseColumn";
import { ForeignKey } from "./constraints/ForeignKey";
import { UniqueConstraint } from "./constraints/UniqueConstraint";

export type BaseModel = {
    table: string;
    schema: string;
    primaryKey: string[];
    uniqueConstraints: UniqueConstraint[];
    foreignKeys: ForeignKey[];
    columns: Record<string, BaseColumn>;
};
