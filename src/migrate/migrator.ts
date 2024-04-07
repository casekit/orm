import { Orm } from "..";
import { BaseOrm } from "../types/base/BaseOrm";
import { ModelDefinitions } from "../types/schema/definitions/ModelDefinitions";
import { RelationsDefinitions } from "../types/schema/definitions/RelationsDefinitions";
import { implode } from "./commands/implode";

export class Migrator {
    public db: BaseOrm;

    constructor(db: BaseOrm) {
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
) => new Migrator(db as BaseOrm);
