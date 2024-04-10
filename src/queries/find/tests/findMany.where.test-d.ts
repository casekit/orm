import { assertType, describe, test } from "vitest";

import { db } from "../../../test/db";
import { $gte, $ilike, $like, $not, $or } from "../../where/operators";

describe("findMany", () => {
    test("where clauses can only refer to fields that exist on the model", async () => {
        assertType(
            await db.findMany("post", {
                select: ["id", "title", "content"],
                where: {
                    title: "I like cats",
                    // @ts-expect-error 'wrong' is not a field on the post model
                    wrong: 2,
                },
            }),
        );
    });

    test("where clauses allow conditions to be grouped using logical operators", async () => {
        assertType(
            await db.findMany("post", {
                select: ["id", "title", "content"],
                where: {
                    title: { [$like]: "I like %" },
                    [$or]: [
                        { title: { [$ilike]: "%dogs" } },
                        { title: { [$ilike]: "%cats" } },
                    ],
                },
            }),
        );
    });

    test("only text fields can be queried with like and ilike", async () => {
        assertType(
            await db.findMany("post", {
                select: ["id", "title", "content"],
                where: {
                    publishedAt: {
                        // @ts-expect-error 'like' cannot be used with a date field
                        [$like]: "2021-01-%",
                    },
                },
            }),
        );
    });

    test("where clauses can be applied to N:1 relations", async () => {
        assertType(
            await db.findMany("post", {
                select: ["id", "title", "content"],
                include: {
                    author: {
                        select: ["id", "username"],
                        where: {
                            username: "Russell",
                            joinedAt: { [$gte]: new Date("2021-01-01") },
                        },
                    },
                },
            }),
        );
    });

    test("where clauses can be applied to 1:N relations", async () => {
        assertType(
            await db.findMany("user", {
                select: ["id", "username"],
                include: {
                    posts: {
                        select: ["id", "title"],
                        where: {
                            publishedAt: { [$gte]: new Date("2021-01-01") },
                        },
                    },
                },
            }),
        );
    });

    test("where clauses can be applied to N:N relations", async () => {
        assertType(
            await db.findMany("user", {
                select: ["id", "username"],
                include: {
                    tenants: {
                        select: ["id", "name"],
                        where: {
                            [$not]: {
                                name: { [$like]: "% (Archived)" },
                            },
                        },
                    },
                },
            }),
        );
    });
});
