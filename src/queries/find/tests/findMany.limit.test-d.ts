import { assertType, describe, test } from "vitest";

import { db } from "../../../test/db";

describe("findMany", () => {
    test("queries can have limits and offsets applied", () => {
        assertType(
            db.findMany("post", {
                select: ["id", "content"],
                limit: 2,
                offset: 5,
            }),
        );
    });

    test("included N:1 relations cannot have limits applied", () => {
        assertType(
            db.findMany("post", {
                select: ["id", "content"],
                include: {
                    author: {
                        select: ["username"],
                        // @ts-expect-error N:1 relations cannot have limits applied
                        limit: 1,
                    },
                },
            }),
        );
    });

    test("included N:1 relations cannot have offsets applied", () => {
        assertType(
            db.findMany("post", {
                select: ["id", "content"],
                include: {
                    author: {
                        select: ["username"],
                        // @ts-expect-error N:1 relations cannot have offsets applied
                        offset: 1,
                    },
                },
            }),
        );
    });

    test("included 1:N relations can have limits and offsets applied", () => {
        assertType(
            db.findMany("user", {
                select: ["id", "username"],
                include: {
                    posts: {
                        select: ["title"],
                        offset: 1,
                        limit: 2,
                    },
                },
            }),
        );
    });

    test("included N:N relations can have offsets and limits applied", () => {
        assertType(
            db.findMany("user", {
                select: ["id", "username"],
                include: {
                    tenants: {
                        select: ["name"],
                        offset: 1,
                        limit: 2,
                    },
                },
            }),
        );
    });
});
