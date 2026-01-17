import { migrate } from "@casekit/orm-migrate";

import { Handler } from "#types.js";
import { loadConfig } from "#util/loadConfig.js";
import { builder } from "./options.js";

export const handler: Handler<typeof builder> = async (opts) => {
    const { db } = await loadConfig(opts);

    try {
        await migrate.push(db);
        console.log("✅ Done");
    } catch (e) {
        console.error("Error pushing schema to database", e);
        process.exitCode = 1;
        throw e;
    }
};
