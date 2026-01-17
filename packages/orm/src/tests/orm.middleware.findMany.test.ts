import {
    afterAll,
    beforeAll,
    beforeEach,
    describe,
    expect,
    test,
    vi,
} from "vitest";

import { config } from "@casekit/orm-fixtures";

import { Orm, orm } from "../orm.js";
import { mockLogger } from "./util/logger.js";

describe("orm.findMany: middleware", () => {
    const logger = mockLogger();
    let db: Orm<typeof config>;

    beforeEach(() => {
        logger.clear();
    });

    beforeAll(async () => {
        db = orm({ ...config, logger });
        await db.connect();
    });

    afterAll(async () => {
        await db.close();
    });

    describe("findMany middleware", () => {
        test("it allows overriding the orm's findMany method", async () => {
            await db.transact(
                async (db) => {
                    // Create multiple test users
                    await db.createMany("user", {
                        values: [
                            {
                                id: 1,
                                name: "Test User 1",
                                email: "test1@example.com",
                                role: "user",
                            },
                            {
                                id: 2,
                                name: "Test User 2",
                                email: "test2@example.com",
                                role: "admin",
                            },
                        ],
                        returning: ["id"],
                    });

                    const stub = vi.fn();
                    const dbWithMiddleware = db.middleware([
                        {
                            findMany: (db, table, query) => {
                                stub("called stub in middleware 1");
                                return db.findMany(table, query);
                            },
                        },
                        {
                            findMany: (db, table, query) => {
                                stub("called stub in middleware 2");
                                return db.findMany(table, query);
                            },
                        },
                    ]);

                    const results = await dbWithMiddleware.findMany("user", {
                        select: ["id", "name"],
                        where: { role: "user" },
                    });

                    expect(results).toEqual([{ id: 1, name: "Test User 1" }]);

                    expect(stub.mock.calls).toEqual([
                        ["called stub in middleware 1"],
                        ["called stub in middleware 2"],
                    ]);
                },
                { rollback: true },
            );
        });
    });
});
