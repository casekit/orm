import { drop } from "#drop.js";
import { pull } from "#pull.js";
import { push } from "#push.js";

export const migrate = {
    drop,
    push,
    pull,
};

export type { Table } from "#pull.js";
export type {
    Column,
    ForeignKey,
    PrimaryKey,
    UniqueConstraint,
} from "#pull/index.js";
