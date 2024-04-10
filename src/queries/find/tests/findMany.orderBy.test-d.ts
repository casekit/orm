import { assertType, describe, test } from "vitest";

import { db } from "../../../test/db";

describe("findMany", () => {
    test("queries can only be ordered by columns that exist", () => {
        assertType(
            db.findMany("post", {
                select: ["id", "content"],
                orderBy: [
                    "title",
                    // @ts-expect-error "wrong" is not a column on the post model
                    "wrong",
                ],
            }),
        );
    });

    test("queries can be ordered by columns ascending, descending, or implicitly ascending", () => {
        assertType(
            db.findMany("post", {
                select: ["id", "content"],
                orderBy: ["title", ["content", "asc"], ["id", "desc"]],
            }),
        );
    });

    test("anything other than asc or desc as a sort order gives a type error", () => {
        assertType(
            db.findMany("post", {
                select: ["id", "content"],
                orderBy: [
                    "title",
                    ["content", "asc"],
                    // @ts-expect-error "wrong" is not a valid sort order
                    ["id", "wrong"],
                ],
            }),
        );
    });

    test("included N:1 relations cannot be ordered", () => {
        assertType(
            db.findMany("post", {
                select: ["id", "content"],
                include: {
                    author: {
                        select: ["username"],
                        // @ts-expect-error N:1 relations cannot be ordered
                        orderBy: ["username"],
                    },
                },
            }),
        );
    });

    test("included 1:N relations can be ordered", () => {
        assertType(
            db.findMany("user", {
                select: ["id", "username"],
                include: {
                    posts: {
                        select: ["title"],
                        orderBy: ["title"],
                    },
                },
            }),
        );
    });

    test("included N:N relations can be ordered", () => {
        assertType(
            db.findMany("user", {
                select: ["id", "username"],
                include: {
                    tenants: {
                        select: ["name"],
                        orderBy: ["name"],
                    },
                },
            }),
        );
    });
});
