import { NormalizedFieldDefinition } from "./NormalizedFieldDefinition.js";
import { NormalizedForeignKeyDefinition } from "./NormalizedForeignKeyDefinition.js";
import { NormalizedPrimaryKey } from "./NormalizedPrimaryKey.js";
import { NormalizedRelationDefinition } from "./NormalizedRelationDefinition.js";
import { NormalizedUniqueConstraintDefinition } from "./NormalizedUniqueConstraintDefinition.js";

export interface NormalizedModelDefinition {
    name: string;
    schema: string;
    table: string;
    primaryKey: NormalizedPrimaryKey[];
    uniqueConstraints: NormalizedUniqueConstraintDefinition[];
    foreignKeys: NormalizedForeignKeyDefinition[];
    relations: Record<string, NormalizedRelationDefinition>;
    fields: Record<string, NormalizedFieldDefinition>;
}
