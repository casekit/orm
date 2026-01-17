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

describe("orm.findOne: middleware", () => {
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

    describe("findOne middleware", () => {
        test("it allows overriding the orm's findOne method", async () => {
            await db.transact(
                async (db) => {
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
                            findOne: (db, table, query) => {
                                stub("called stub in middleware 1");
                                return db.findOne(table, query);
                            },
                        },
                        {
                            findOne: (db, table, query) => {
                                stub("called stub in middleware 2");
                                return db.findOne(table, query);
                            },
                        },
                    ]);
                    const result = await dbWithMiddleware.findOne("user", {
                        select: ["id", "name"],
                        where: { id: 1 },
                    });
                    expect(result).toEqual({ id: 1, name: "Test User" });
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
