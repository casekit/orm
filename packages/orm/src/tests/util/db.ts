import { Models, config } from "@casekit/orm-fixtures";
import { Config } from "@casekit/orm-schema";
import { makeFactory } from "@casekit/orm-testing";

import { orm } from "#orm.js";
import { mockLogger } from "./logger.js";

export const createTestDB = (overrides?: Partial<Omit<Config, "models">>) => {
    const logger = mockLogger();
    const db = orm({ ...config, logger, ...overrides });
    const factory = makeFactory<Models>(db.config);

    return { db, logger, factory };
};
