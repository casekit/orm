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

describe("orm.createMany: middleware", () => {
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

    describe("createMany middleware", () => {
        test("it allows overriding the orm's createMany method", async () => {
            await db.transact(
                async (db) => {
                    const stub = vi.fn();
                    const dbWithMiddleware = db.middleware([
                        {
                            createMany: (db, table, query) => {
                                stub("called stub in middleware 1");
                                return db.createMany(table, query);
                            },
                        },
                        {
                            createMany: (db, table, query) => {
                                stub("called stub in middleware 2");
                                return db.createMany(table, query);
                            },
                        },
                    ]);

                    const result = await dbWithMiddleware.createMany("user", {
                        values: [
                            {
                                name: "Test User 1",
                                email: "test1@example.com",
                                role: "user",
                            },
                            {
                                name: "Test User 2",
                                email: "test2@example.com",
                                role: "user",
                            },
                        ],
                        returning: ["id", "name"],
                    });

                    expect(result).toHaveLength(2);
                    expect(result).toEqual(
                        expect.arrayContaining([
                            expect.objectContaining({ name: "Test User 1" }),
                            expect.objectContaining({ name: "Test User 2" }),
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
