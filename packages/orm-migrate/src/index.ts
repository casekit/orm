import { drop } from "#drop.js";
import { generate } from "#migrations/generate.js";
import { run } from "#migrations/run.js";
import { pull } from "#pull.js";
import { push } from "#push.js";

export const migrate = {
    drop,
    push,
    pull,
    generate,
    run,
};

export type { Table } from "#pull.js";
export type {
    Column,
    ForeignKey,
    PrimaryKey,
    UniqueConstraint,
} from "#pull/index.js";
export type { GenerateResult } from "#migrations/generate.js";
export type { Migration, RunResult } from "#migrations/run.js";
export type { SafetyWarning, SafetyLevel } from "#migrations/safety/types.js";
export type { SchemaDiffOperation } from "#migrations/diff/types.js";
export {
    detectPotentialRenames,
    applyRenames,
} from "#migrations/diff/detectRenames.js";
export type { PotentialRename } from "#migrations/diff/detectRenames.js";
export { operationsToSql } from "#migrations/diff/operationToSql.js";
