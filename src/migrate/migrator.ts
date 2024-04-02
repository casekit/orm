import { Orm } from "..";
import { ModelDefinitions } from "../types/schema/definition/ModelDefinitions";
import { implode } from "./commands/implode";

export class Migrator<Models extends ModelDefinitions> {
    public db: Orm<Models>;

    constructor(db: Orm<Models>) {
        this.db = db;
    }

    public async implode(opts = { dryRun: true, output: true }) {
        implode(this.db, opts);
    }
}

export const migrator = <Models extends ModelDefinitions>(db: Orm<Models>) =>
    new Migrator(db);
