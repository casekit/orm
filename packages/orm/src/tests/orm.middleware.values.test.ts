import {
    afterAll,
    beforeAll,
    beforeEach,
    describe,
    expect,
    test,
} from "vitest";

import { config } from "@casekit/orm-fixtures";

import { Orm, orm } from "../orm.js";
import { Middleware } from "../types/Middleware.js";
import { mockLogger } from "./util/logger.js";

const uppercaseName = (): Middleware => ({
    values: (_config, _modelName, values) => {
        if ("name" in values && typeof values["name"] === "string") {
            return { ...values, name: values["name"].toUpperCase() };
        } else {
            return values;
        }
    },
});

const addPrefixToName = (): Middleware => ({
    values: (_config, _modelName, values) => {
        if ("name" in values && typeof values["name"] === "string") {
            return { ...values, name: `prefix_${values["name"]}` };
        } else {
            return values;
        }
    },
});

describe("values middleware", () => {
    const logger = mockLogger();
    let db: Orm<typeof config>;

    beforeEach(() => {
        logger.clear();
    });

    beforeAll(async () => {
        db = orm({ ...config, logger }).middleware([
            uppercaseName(),
            addPrefixToName(),
        ]);
        await db.connect();
    });

    afterAll(async () => {
        await db.close();
    });

    test("values in createOne", async () => {
        await db.transact(
            async (db) => {
                const user = await db.createOne("user", {
                    values: {
                        id: 1,
                        name: "russell",
                        email: "russell@example.com",
                        role: "user",
                    },
                    returning: ["id", "name", "email"],
                });
                expect(user).toEqual({
                    id: 1,
                    name: "prefix_RUSSELL",
                    email: "russell@example.com",
                });
            },
            { rollback: true },
        );
    });

    test("values in createMany", async () => {
        await db.transact(
            async (db) => {
                const users = await db.createMany("user", {
                    values: [
                        {
                            id: 1,
                            name: "alice",
                            email: "alice@example.com",
                            role: "user",
                        },
                        {
                            id: 2,
                            name: "bob",
                            email: "bob@example.com",
                            role: "admin",
                        },
                    ],
                    returning: ["id", "name", "email", "role"],
                });
                expect(users).toEqual([
                    {
                        id: 1,
                        name: "prefix_ALICE",
                        email: "alice@example.com",
                        role: "user",
                    },
                    {
                        id: 2,
                        name: "prefix_BOB",
                        email: "bob@example.com",
                        role: "admin",
                    },
                ]);
            },
            { rollback: true },
        );
    });

    test("values middleware with multiple values in createMany", async () => {
        await db.transact(
            async (db) => {
                const users = await db.createMany("user", {
                    values: [
                        {
                            id: 1,
                            name: "charlie",
                            email: "charlie@example.com",
                            role: "user",
                        },
                        {
                            id: 2,
                            name: "diana",
                            email: "diana@example.com",
                            role: "user",
                        },
                        {
                            id: 3,
                            name: "eve",
                            email: "eve@example.com",
                            role: "admin",
                        },
                    ],
                    returning: ["id", "name"],
                });
                expect(users.map((u) => u.name)).toEqual([
                    "prefix_CHARLIE",
                    "prefix_DIANA",
                    "prefix_EVE",
                ]);
            },
            { rollback: true },
        );
    });
});
