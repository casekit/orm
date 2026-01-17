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

describe("orm.createOne: middleware", () => {
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

    describe("createOne middleware", () => {
        test("it allows overriding the orm's createOne method", async () => {
            await db.transact(
                async (db) => {
                    const stub = vi.fn();
                    const dbWithMiddleware = db.middleware([
                        {
                            createOne: (db, table, query) => {
                                stub("called stub in middleware 1");
                                return db.createOne(table, query);
                            },
                        },
                        {
                            createOne: (db, table, query) => {
                                stub("called stub in middleware 2");
                                return db.createOne(table, query);
                            },
                        },
                    ]);

                    const result = await dbWithMiddleware.createOne("user", {
                        values: {
                            name: "Test User",
                            email: "test@example.com",
                            role: "user",
                        },
                        returning: ["id", "name"],
                    });

                    expect(result).toMatchObject({
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
