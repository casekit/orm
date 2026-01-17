import {
    afterAll,
    beforeAll,
    beforeEach,
    describe,
    expect,
    test,
} from "vitest";

import { config } from "@casekit/orm-fixtures";

import { $ilike } from "../operators.js";
import { Orm, orm } from "../orm.js";
import { Middleware } from "../types/Middleware.js";
import { mockLogger } from "./util/logger.js";

const uppercasename = (): Middleware => ({
    set: (_config, _modelName, set) => {
        if ("name" in set && typeof set["name"] === "string") {
            return { ...set, name: set["name"].toUpperCase() };
        } else {
            return set;
        }
    },
});

const addprefixtoname = (): Middleware => ({
    set: (_config, _modelName, set) => {
        if ("name" in set && typeof set["name"] === "string") {
            return { ...set, name: `prefix_${set["name"]}` };
        } else {
            return set;
        }
    },
});

describe("set middleware", () => {
    const logger = mockLogger();
    let db: Orm<typeof config>;

    beforeEach(() => {
        logger.clear();
    });

    beforeAll(async () => {
        db = orm({ ...config, logger }).middleware([
            uppercasename(),
            addprefixtoname(),
        ]);
        await db.connect();
    });

    afterAll(async () => {
        await db.close();
    });

    test("set in updateOne", async () => {
        await db.transact(
            async (db) => {
                const user = await db.createOne("user", {
                    values: {
                        id: 1,
                        name: "Test User",
                        email: "test@example.com",
                        role: "user",
                    },
                    returning: ["id", "name"],
                });
                const updatedUser = await db.updateOne("user", {
                    set: {
                        name: "russell",
                        email: "russell@example.com",
                    },
                    where: { id: user.id },
                    returning: ["id", "name", "email"],
                });
                expect(updatedUser).toEqual({
                    id: user.id,
                    name: "prefix_RUSSELL",
                    email: "russell@example.com",
                });
            },
            { rollback: true },
        );
    });

    test("set in updateMany", async () => {
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
                            role: "user",
                        },
                    ],
                    returning: ["id", "name"],
                });
                const updatedUsers = await db.updateMany("user", {
                    set: {
                        name: "russell",
                    },
                    where: { email: { [$ilike]: "%example.com" } },
                    returning: ["id", "name", "email"],
                });
                expect(updatedUsers.map((u) => u.name)).toEqual([
                    "prefix_RUSSELL",
                    "prefix_RUSSELL",
                ]);
            },
            { rollback: true },
        );
    });
});
