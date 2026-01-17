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

describe("orm.count: middleware", () => {
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

    describe("count middleware", () => {
        test("it allows overriding the orm's count method", async () => {
            await db.transact(
                async (db) => {
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
                            {
                                id: 3,
                                name: "Test User 3",
                                email: "test3@example.com",
                                role: "user",
                            },
                        ],
                        returning: ["id"],
                    });

                    const stub = vi.fn();
                    const dbWithMiddleware = db.middleware([
                        {
                            count: (db, table, query) => {
                                stub("called stub in middleware 1");
                                return db.count(table, query);
                            },
                        },
                        {
                            count: (db, table, query) => {
                                stub("called stub in middleware 2");
                                return db.count(table, query);
                            },
                        },
                    ]);

                    const count = await dbWithMiddleware.count("user", {
                        where: { role: "user" },
                    });

                    expect(count).toBe(2);

                    expect(stub.mock.calls).toEqual([
                        ["called stub in middleware 1"],
                        ["called stub in middleware 2"],
                    ]);
                },
                { rollback: true },
            );
        });

        test("middleware can modify count behavior", async () => {
            await db.transact(
                async (db) => {
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

                    const dbWithMiddleware = db.middleware([
                        {
                            count: () => {
                                return Promise.resolve(42);
                            },
                        },
                    ]);

                    const count = await dbWithMiddleware.count("user", {});
                    expect(count).toBe(42);

                    const originalCount = await db.count("user", {});
                    expect(originalCount).toBe(2);
                },
                { rollback: true },
            );
        });

        test("middleware executes in the correct order", async () => {
            await db.transact(
                async (db) => {
                    const executionOrder: string[] = [];

                    const dbWithMiddleware = db.middleware([
                        {
                            count: (db, table, query) => {
                                executionOrder.push("middleware 1 start");
                                const result = db.count(table, query);
                                executionOrder.push("middleware 1 end");
                                return result;
                            },
                        },
                        {
                            count: (db, table, query) => {
                                executionOrder.push("middleware 2 start");
                                const result = db.count(table, query);
                                executionOrder.push("middleware 2 end");
                                return result;
                            },
                        },
                    ]);

                    await dbWithMiddleware.count("user", {});

                    expect(executionOrder).toEqual([
                        "middleware 1 start",
                        "middleware 2 start",
                        "middleware 2 end",
                        "middleware 1 end",
                    ]);
                },
                { rollback: true },
            );
        });
    });
});
