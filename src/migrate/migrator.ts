import { Orm } from "..";
import { BaseOrm } from "../schema/types/base/BaseOrm";
import { LooseModelDefinitions } from "../schema/types/loose/LooseModelDefinitions";
import { LooseRelationsDefinitions } from "../schema/types/loose/LooseRelationsDefinitions";
import { implode } from "./commands/implode";

export class Migrator {
    public db: BaseOrm;

    constructor(db: BaseOrm) {
        this.db = db;
    }

    public async implode(opts = { dryRun: true, output: true }) {
        await implode(this.db, opts);
    }
}

export const migrator = <
    Models extends LooseModelDefinitions,
    Relations extends LooseRelationsDefinitions<Models>,
>(
    db: Orm<Models, Relations>,
) => new Migrator(db as BaseOrm);
