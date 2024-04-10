import { Orm } from "..";
import { BaseOrm } from "../schema/types/base/BaseOrm";
import { ModelDefinitions } from "../schema/types/definitions/ModelDefinitions";
import { RelationsDefinitions } from "../schema/types/definitions/RelationsDefinitions";
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
