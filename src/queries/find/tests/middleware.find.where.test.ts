import { snakeCase } from "lodash-es";
import pg from "pg";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { orm } from "../../../orm";
import { models, relations } from "../../../test/db";
import { seed } from "../../../test/seed";
import { $not } from "../../clauses/where/operators";
import { Middleware } from "../../middleware/Middleware";

export const timestamps: Middleware = {
    create: {
        values: (values, { model, config }) => {
            if ("createdAt" in config.models[model].columns) {
                return {
                    createdAt: new Date(),
                    ...values,
                };
            }
            return values;
        },
    },
    update: {
        set: (set, { model, config }) => {
            if ("updatedAt" in config.models[model].columns) {
                return {
                    updatedAt: new Date(),
                    ...set,
                };
            } else {
                return set;
            }
        },
    },
};

export const softdelete: Middleware = {
    where: (where, { model, config }) => {
        if ("deletedAt" in config.models[model].columns) {
            return {
                deletedAt: null,
                ...where,
            };
        } else {
            return where;
        }
    },
    delete: {
        deleteOne: (params, { model, config, deleteOne, updateOne }) => {
            if ("deletedAt" in config.models[model].columns) {
                return updateOne({
                    ...params,
                    set: {
                        deletedAt: new Date(),
                    },
                });
            } else return deleteOne(params);
        },
        deleteMany: (params, { model, config, deleteMany, updateMany }) => {
            if ("deletedAt" in config.models[model].columns) {
                return updateMany({
                    ...params,
                    set: {
                        deletedAt: new Date(),
                    },
                });
            } else return deleteMany(params);
        },
    },
};

describe("middleware.find.where", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test("it allows modifying the query object before a find operation", async () => {
        const db = orm({
            models,
            relations,
            extensions: ["uuid-ossp"],
            naming: { column: snakeCase },
            schema: "casekit",
            middleware: [softdelete],
            pool: new pg.Pool(),
        });
        await db.transact(
            async (db) => {
                const { users } = await seed(db, {
                    users: [
                        {
                            username: "Lynne Tillman",
                            tenants: [{ name: "Popova Park", posts: 2 }],
                        },
                    ],
                });

                const lynne = users["Lynne Tillman"];

                expect(
                    await db.findMany("post", {
                        select: ["title"],
                        where: { authorId: lynne.id },
                        orderBy: ["title"],
                    }),
                ).toEqual([{ title: "Post a" }, { title: "Post b" }]);

                await db.updateMany("post", {
                    set: { deletedAt: new Date() },
                    where: { authorId: lynne.id },
                });

                expect(
                    await db.findMany("post", {
                        select: ["title"],
                        where: { authorId: lynne.id },
                        orderBy: ["title"],
                    }),
                ).toEqual([]);
            },
            { rollback: true },
        );
    });

    test("it applies to N:1 relations", async () => {
        const db = orm({
            models,
            relations,
            extensions: ["uuid-ossp"],
            naming: { column: snakeCase },
            schema: "casekit",
            middleware: [softdelete],
            pool: new pg.Pool(),
        });
        await db.transact(
            async (db) => {
                const { users } = await seed(db, {
                    users: [
                        {
                            username: "Lynne Tillman",
                            tenants: [{ name: "Popova Park", posts: 2 }],
                        },
                    ],
                });

                const lynne = users["Lynne Tillman"];

                expect(
                    await db.findMany("post", {
                        select: ["title"],
                        where: { authorId: lynne.id },
                        orderBy: ["title"],
                    }),
                ).toEqual([{ title: "Post a" }, { title: "Post b" }]);

                await db.updateOne("user", {
                    set: { deletedAt: new Date() },
                    where: { id: lynne.id },
                });

                expect(
                    await db.findMany("post", {
                        select: ["title"],
                        include: { author: { select: ["username"] } },
                        orderBy: ["title"],
                    }),
                ).toEqual([]);
            },
            { rollback: true },
        );
    });

    test("it applies to 1:N relations", async () => {
        const db = orm({
            models,
            relations,
            extensions: ["uuid-ossp"],
            naming: { column: snakeCase },
            schema: "casekit",
            middleware: [softdelete],
            pool: new pg.Pool(),
        });
        await db.transact(
            async (db) => {
                const { users } = await seed(db, {
                    users: [
                        {
                            username: "Lynne Tillman",
                            tenants: [{ name: "Popova Park", posts: 2 }],
                        },
                    ],
                });

                const lynne = users["Lynne Tillman"];

                expect(
                    await db.findMany("post", {
                        select: ["title"],
                        where: { authorId: lynne.id },
                        orderBy: ["title"],
                    }),
                ).toEqual([{ title: "Post a" }, { title: "Post b" }]);

                await db.updateOne("post", {
                    set: { deletedAt: new Date() },
                    where: { title: "Post a" },
                });

                expect(
                    await db.findOne("user", {
                        select: ["username"],
                        include: { posts: { select: ["title"] } },
                        where: { id: lynne.id },
                    }),
                ).toEqual({
                    username: "Lynne Tillman",
                    posts: [{ title: "Post b" }],
                });
            },
            { rollback: true },
        );
    });

    test("it applies to N:N relations", async () => {
        const db = orm({
            models,
            relations,
            extensions: ["uuid-ossp"],
            naming: { column: snakeCase },
            schema: "casekit",
            middleware: [softdelete],
            pool: new pg.Pool(),
        });
        await db.transact(
            async (db) => {
                await seed(db, {
                    users: [
                        {
                            username: "Lynne Tillman",
                            tenants: [{ name: "Popova Park", posts: 2 }],
                        },
                    ],
                });

                expect(
                    await db.findMany("tenant", {
                        select: ["name"],
                        include: { users: { select: ["username"] } },
                        orderBy: ["name"],
                    }),
                ).toEqual([
                    {
                        name: "Popova Park",
                        users: [{ username: "Lynne Tillman" }],
                    },
                ]);

                await db.updateOne("user", {
                    set: { deletedAt: new Date() },
                    where: { username: "Lynne Tillman" },
                });

                expect(
                    await db.findOne("tenant", {
                        select: ["name"],
                        include: { users: { select: ["username"] } },
                        where: { name: "Popova Park" },
                    }),
                ).toEqual({
                    name: "Popova Park",
                    users: [],
                });
            },
            { rollback: true },
        );
    });

    test("it works even if there is no where clause in the original query", async () => {
        const db = orm({
            models,
            relations,
            extensions: ["uuid-ossp"],
            naming: { column: snakeCase },
            schema: "casekit",
            middleware: [softdelete],
            pool: new pg.Pool(),
        });
        await db.transact(
            async (db) => {
                const { users } = await seed(db, {
                    users: [
                        {
                            username: "Lynne Tillman",
                            tenants: [{ name: "Popova Park", posts: 2 }],
                        },
                    ],
                });

                const lynne = users["Lynne Tillman"];

                expect(
                    await db.findMany("post", {
                        select: ["title"],
                        where: { authorId: lynne.id },
                        orderBy: ["title"],
                    }),
                ).toEqual([{ title: "Post a" }, { title: "Post b" }]);

                await db.updateMany("post", {
                    set: { deletedAt: new Date() },
                    where: { authorId: lynne.id },
                });

                expect(
                    await db.findMany("post", { select: ["title"] }),
                ).toEqual([]);
            },
            { rollback: true },
        );
    });

    test("multilpe middlewares can be applied", async () => {
        const db = orm({
            models,
            relations,
            extensions: ["uuid-ossp"],
            naming: { column: snakeCase },
            schema: "casekit",
            middleware: [softdelete, timestamps],
            pool: new pg.Pool(),
        });

        await db.transact(
            async (db) => {
                const { users } = await seed(db, {
                    users: [
                        {
                            username: "Lynne Tillman",
                            tenants: [{ name: "Popova Park", posts: 2 }],
                        },
                    ],
                });

                vi.setSystemTime(new Date("2022-05-23"));
                const lynne = users["Lynne Tillman"];

                expect(
                    await db.findMany("post", {
                        select: ["title", "updatedAt"],
                        where: { authorId: lynne.id },
                        orderBy: ["title"],
                    }),
                ).toEqual([
                    { title: "Post a", updatedAt: null },
                    { title: "Post b", updatedAt: null },
                ]);

                await db.updateMany("post", {
                    set: { title: "Post AAAAAA" },
                    where: { authorId: lynne.id, title: "Post a" },
                });
                await db.updateMany("post", {
                    set: { deletedAt: new Date() },
                    where: { authorId: lynne.id, title: "Post b" },
                });

                // updatedAt field has been set by the timestamps middleware
                // and Post b is not returned by the query because of the softdelete middleware
                expect(
                    await db.findMany("post", {
                        select: ["title", "updatedAt"],
                    }),
                ).toEqual([
                    {
                        title: "Post AAAAAA",
                        updatedAt: new Date("2022-05-23"),
                    },
                ]);
            },
            { rollback: true },
        );
    });
    test("it allows overriding deleteOne and deleteMany functions", async () => {
        const db = orm({
            models,
            relations,
            extensions: ["uuid-ossp"],
            naming: { column: snakeCase },
            schema: "casekit",
            middleware: [softdelete, timestamps],
            pool: new pg.Pool(),
        });
        await db.transact(
            async (db) => {
                const { users } = await seed(db, {
                    users: [
                        {
                            username: "Lynne Tillman",
                            tenants: [{ name: "Popova Park", posts: 2 }],
                        },
                    ],
                });

                const lynne = users["Lynne Tillman"];

                expect(
                    await db.findMany("post", {
                        select: ["title", "updatedAt"],
                        where: { authorId: lynne.id },
                        orderBy: ["title"],
                    }),
                ).toEqual([
                    { title: "Post a", updatedAt: null },
                    { title: "Post b", updatedAt: null },
                ]);

                vi.setSystemTime(new Date("2022-05-23"));

                await db.deleteMany("post", {
                    where: { authorId: lynne.id, title: "Post a" },
                });

                expect(
                    await db.findMany("post", {
                        select: ["title", "updatedAt", "deletedAt"],
                        where: { deletedAt: { [$not]: null } },
                    }),
                ).toEqual([
                    {
                        title: "Post a",
                        updatedAt: new Date("2022-05-23"),
                        deletedAt: new Date("2022-05-23"),
                    },
                ]);

                vi.setSystemTime(new Date("2022-05-24"));

                await db.deleteOne("post", {
                    where: { authorId: lynne.id, title: "Post b" },
                });

                expect(
                    await db.findMany("post", {
                        select: ["title", "updatedAt", "deletedAt"],
                        where: { deletedAt: { [$not]: null } },
                    }),
                ).toEqual([
                    {
                        title: "Post a",
                        updatedAt: new Date("2022-05-23"),
                        deletedAt: new Date("2022-05-23"),
                    },
                    {
                        title: "Post b",
                        updatedAt: new Date("2022-05-24"),
                        deletedAt: new Date("2022-05-24"),
                    },
                ]);
            },
            { rollback: true },
        );
    });
});
