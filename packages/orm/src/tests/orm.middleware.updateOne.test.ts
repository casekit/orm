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

describe("orm.updateOne: middleware", () => {
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

    describe("updateOne middleware", () => {
        test("it allows overriding the orm's updateOne method", async () => {
            await db.transact(
                async (db) => {
                    // Create a test user to update
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
                            updateOne: (db, table, query) => {
                                stub("called stub in middleware 1");
                                return db.updateOne(table, query);
                            },
                        },
                        {
                            updateOne: (db, table, query) => {
                                stub("called stub in middleware 2");
                                return db.updateOne(table, query);
                            },
                        },
                    ]);

                    const result = await dbWithMiddleware.updateOne("user", {
                        where: { id: user.id },
                        set: { name: "Updated User" },
                        returning: ["id", "name"],
                    });

                    expect(result).toMatchObject({
                        id: 1,
                        name: "Updated User",
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
