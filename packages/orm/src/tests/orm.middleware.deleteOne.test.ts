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

describe("orm.deleteOne: middleware", () => {
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

    describe("deleteOne middleware", () => {
        test("it allows overriding the orm's deleteOne method", async () => {
            await db.transact(
                async (db) => {
                    // Create a test user to delete
                    const user = await db.createOne("user", {
                        values: {
                            id: 1,
                            name: "Test User",
                            email: "test@example.com",
                            role: "user",
                        },
                        returning: ["id"],
                    });

                    const stub = vi.fn();
                    const dbWithMiddleware = db.middleware([
                        {
                            deleteOne: (db, table, query) => {
                                stub("called stub in middleware 1");
                                return db.deleteOne(table, query);
                            },
                        },
                        {
                            deleteOne: (db, table, query) => {
                                stub("called stub in middleware 2");
                                return db.deleteOne(table, query);
                            },
                        },
                    ]);

                    const result = await dbWithMiddleware.deleteOne("user", {
                        where: { id: user.id },
                        returning: ["id", "name"],
                    });

                    expect(result).toMatchObject({
                        id: 1,
                        name: "Test User",
                    });

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
