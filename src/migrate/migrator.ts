import { Orm } from "@casekit/orm";

import { SchemaDefinition } from "~/types/schema/definition/SchemaDefinition";

import { implode } from "./commands/implode";

export class Migrator<S extends SchemaDefinition> {
    public db: Orm<S>;

    constructor(db: Orm<S>) {
        this.db = db;
    }

    public async implode(opts = { dryRun: true, output: true }) {
        implode(this.db, opts);
    }
}

export const migrator = <S extends SchemaDefinition>(db: Orm<S>) =>
    new Migrator(db);
