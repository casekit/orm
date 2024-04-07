import { Orm } from "..";
import { ModelDefinitions } from "../types/schema/definition/ModelDefinitions";
import { RelationsDefinitions } from "../types/schema/definition/RelationsDefinitions";
import { implode } from "./commands/implode";

export class Migrator {
    public db: Orm;

    constructor(db: Orm) {
        this.db = db;
    }

    public async implode(opts = { dryRun: true, output: true }) {
        implode(this.db, opts);
    }
}

export const migrator = <
    Models extends ModelDefinitions,
    Relations extends RelationsDefinitions<Models>,
>(
    db: Orm<Models, Relations>,
) => new Migrator(db as Orm);
