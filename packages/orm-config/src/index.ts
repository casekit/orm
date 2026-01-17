export { normalizeConfig } from "./normalize/normalizeConfig.js";
export { normalizeModel } from "./normalize/normalizeModel.js";
export { normalizeUniqueConstraint } from "./normalize/normalizeUniqueConstraints.js";
export type { NormalizedConfig } from "./types/NormalizedConfig.js";
export type { NormalizedFieldDefinition } from "./types/NormalizedFieldDefinition.js";
export type { NormalizedForeignKeyDefinition } from "./types/NormalizedForeignKeyDefinition.js";
export type { NormalizedModelDefinition } from "./types/NormalizedModelDefinition.js";
export type { NormalizedPrimaryKey } from "./types/NormalizedPrimaryKey.js";
export type {
    NormalizedManyToManyRelationDefinition,
    NormalizedManyToOneRelationDefinition,
    NormalizedOneToManyRelationDefinition,
    NormalizedRelationDefinition,
} from "./types/NormalizedRelationDefinition.js";
export type { NormalizedUniqueConstraintDefinition } from "./types/NormalizedUniqueConstraintDefinition.js";

export { getField, getModel, getRelation } from "./util.js";
