import { afterAll, beforeAll, describe, expect, test } from "vitest";

import { config } from "@casekit/orm-fixtures";

import { orm } from "../orm.js";
import { mockLogger } from "./util/logger.js";

describe("orm.restrict", () => {
    const logger = mockLogger();
    const db = orm({ ...config, logger });

    beforeAll(async () => {
        await db.connect();
    });

    afterAll(async () => {
        await db.close();
    });

    test("foo", () => {
        let x = {
            foo: 2,
            bar: 4,
        };
        expect(x.foo).toEqual(2);
        x = {
            ...x,
            get foo(): number {
                throw new Error("haha");
            },
        };
        expect(() => x.foo).toThrow();
    });

    //     test("it allows querying permitted models", async () => {
    //         await db.restrict(["user", "post"]).transact(
    //             async (db) => {
    //                 // Create a user
    //                 const user = await db.createOne("user", {
    //                     values: {
    //                         name: "Test User",
    //                         email: "test@example.com",
    //                         role: "user",
    //                     },
    //                     returning: ["id", "name"],
    //                 });

    //                 // Create a post for that user
    //                 await db.createOne("post", {
    //                     values: {
    //                         title: "Test Post",
    //                         content: "Test Content",
    //                         authorId: user.id,
    //                     },
    //                 });

    //                 // Should be able to query both models
    //                 const result = await db.findOne("user", {
    //                     select: ["id", "name"],
    //                     include: {
    //                         posts: {
    //                             select: ["id", "title"],
    //                         },
    //                     },
    //                     where: { id: user.id },
    //                 });

    //                 expect(result.name).toBe("Test User");
    //                 expect(result.posts).toHaveLength(1);
    //                 expect(result.posts[0]!.title).toBe("Test Post");
    //             },
    //             { rollback: true },
    //         );
    //     });

    //     test("if an unpermitted model is queried despite the type error, it throws an exception", async () => {
    //         await expect(
    //             db.restrict(["user"]).transact(
    //                 async (db) => {
    //                     // @ts-expect-error - post model should not be accessible
    //                     await db.findOne("post", {
    //                         select: ["id"],
    //                     });
    //                 },
    //                 { rollback: true },
    //             ),
    //         ).rejects.toThrow(
    //             'Model "post" is not permitted in this restricted ORM instance',
    //         );
    //     });

    //     test("if an unpermitted relation is queried despite the type error, it throws an exception", async () => {
    //         await expect(
    //             db.restrict(["user", "post"]).transact(
    //                 async (db) => {
    //                     await db.findOne("user", {
    //                         select: ["id"],
    //                         include: {
    //                             // @ts-expect-error - color relation should not be accessible
    //                             backgroundColor: {
    //                                 select: ["hex"],
    //                             },
    //                         },
    //                     });
    //                 },
    //                 { rollback: true },
    //             ),
    //         ).rejects.toThrow(
    //             'Relation "backgroundColor" references model "color" which is not permitted in this restricted ORM instance',
    //         );
    //     });

    //     test("it throws if called inside a transaction", async () => {
    //         await expect(
    //             db.transact(
    //                 async (db) => {
    //                     const restrictedDb = db.restrict(["user"]);
    //                     await restrictedDb.findOne("user", { select: ["id"] });
    //                 },
    //                 { rollback: true },
    //             ),
    //         ).rejects.toThrowError("Cannot create restricted ORM in a transaction");
    //     });

    //     test("allows querying through permitted N:1 relations", async () => {
    //         await db.restrict(["post", "user"]).transact(
    //             async (db) => {
    //                 const user = await db.createOne("user", {
    //                     values: {
    //                         name: "Test User",
    //                         email: "test@example.com",
    //                         role: "user",
    //                     },
    //                     returning: ["id"],
    //                 });

    //                 await db.createOne("post", {
    //                     values: {
    //                         title: "Test Post",
    //                         content: "Content",
    //                         authorId: user.id,
    //                     },
    //                 });

    //                 const result = await db.findOne("post", {
    //                     select: ["id", "title"],
    //                     include: {
    //                         author: {
    //                             select: ["name"],
    //                         },
    //                     },
    //                     where: { authorId: user.id },
    //                 });

    //                 expect(result.author.name).toBe("Test User");
    //             },
    //             { rollback: true },
    //         );
    //     });

    //     test("allows querying through permitted 1:N relations", async () => {
    //         await db.restrict(["user", "post"]).transact(
    //             async (db) => {
    //                 const user = await db.createOne("user", {
    //                     values: {
    //                         name: "Test User",
    //                         email: "test@example.com",
    //                         role: "user",
    //                     },
    //                     returning: ["id"],
    //                 });

    //                 await db.createOne("post", {
    //                     values: {
    //                         title: "Test Post",
    //                         content: "Content",
    //                         authorId: user.id,
    //                     },
    //                 });

    //                 const result = await db.findOne("user", {
    //                     select: ["id", "name"],
    //                     include: {
    //                         posts: {
    //                             select: ["title"],
    //                         },
    //                     },
    //                     where: { id: user.id },
    //                 });

    //                 expect(result.posts[0]!.title).toBe("Test Post");
    //             },
    //             { rollback: true },
    //         );
    //     });

    //     test("allows querying through permitted N:N relations", async () => {
    //         await db.restrict(["user", "post", "friendship"]).transact(
    //             async (db) => {
    //                 const [stewart, lynne] = await db.createMany("user", {
    //                     values: [
    //                         {
    //                             name: "Stewart Home",
    //                             email: "stewarthome@example.com",
    //                             role: "user",
    //                         },
    //                         {
    //                             name: "Lynne Tillman",
    //                             email: "lynnetillman@example.com",
    //                             role: "admin",
    //                         },
    //                     ],
    //                     returning: ["id", "name"],
    //                 });

    //                 await db.createMany("friendship", {
    //                     values: [
    //                         {
    //                             userId: stewart!.id,
    //                             friendId: lynne!.id,
    //                         },
    //                     ],
    //                 });

    //                 const result = await db.findOne("user", {
    //                     select: ["id"],
    //                     include: {
    //                         friends: {
    //                             select: ["id", "name"],
    //                         },
    //                     },
    //                     where: { id: stewart!.id },
    //                 });

    //                 expect(result.friends[0]!.name).toBe("Lynne Tillman");
    //             },
    //             { rollback: true },
    //         );
    //     });

    //     test("restricting to no models results in an unusable ORM", async () => {
    //         const restrictedDb = db.restrict([]);

    //         // Should have no accessible models
    //         await expect(
    //             restrictedDb.transact(
    //                 async (db) => {
    //                     // @ts-expect-error - no models should be accessible
    //                     await db.findOne("user", {
    //                         select: ["id"],
    //                     });
    //                 },
    //                 { rollback: true },
    //             ),
    //         ).rejects.toThrow(
    //             'Model "user" is not permitted in this restricted ORM instance',
    //         );
    //     });

    //     test("restricting twice maintains the most restrictive set", async () => {
    //         await db
    //             .restrict(["user", "post", "friendship"])
    //             .restrict(["user", "friendship"])
    //             .transact(
    //                 async (db) => {
    //                     // Should be able to query user
    //                     await db.findOne("user", {
    //                         select: ["id"],
    //                     });

    //                     // Should not be able to query post or like
    //                     await expect(
    //                         // @ts-expect-error - post should not be accessible
    //                         db.findOne("post", {
    //                             select: ["id"],
    //                         }),
    //                     ).rejects.toThrow('Model "post" is not permitted');

    //                     await expect(
    //                         // @ts-expect-error - like should not be accessible
    //                         db.findOne("like", {
    //                             select: ["id"],
    //                         }),
    //                     ).rejects.toThrow('Model "like" is not permitted');
    //                 },
    //                 { rollback: true },
    //             );
    //     });
});
