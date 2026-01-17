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

import { $in } from "../operators.js";
import { Orm, orm } from "../orm.js";
import { mockLogger } from "./util/logger.js";

describe("orm.deleteMany: middleware", () => {
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

    describe("deleteMany middleware", () => {
        test("it allows overriding the orm's deleteMany method", async () => {
            await db.transact(
                async (db) => {
                    // Create test users to delete
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
                                role: "user",
                            },
                        ],
                        returning: ["id"],
                    });

                    const stub = vi.fn();
                    const dbWithMiddleware = db.middleware([
                        {
                            deleteMany: (db, table, query) => {
                                stub("called stub in middleware 1");
                                return db.deleteMany(table, query);
                            },
                        },
                        {
                            deleteMany: (db, table, query) => {
                                stub("called stub in middleware 2");
                                return db.deleteMany(table, query);
                            },
                        },
                    ]);

                    const result = await dbWithMiddleware.deleteMany("user", {
                        where: { id: { [$in]: [1, 2] } },
                        returning: ["id", "name"],
                    });

                    expect(result).toHaveLength(2);
                    expect(result).toEqual(
                        expect.arrayContaining([
                            expect.objectContaining({
                                id: 1,
                                name: "Test User 1",
                            }),
                            expect.objectContaining({
                                id: 2,
                                name: "Test User 2",
                            }),
                        ]),
                    );

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
