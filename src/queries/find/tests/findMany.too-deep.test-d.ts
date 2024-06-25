import { assertType, describe, test } from "vitest";

import { db } from "../../../test/db";
import { $and, $gt, $ilike, $not, $or } from "../../clauses/where/operators";

describe("findMany", () => {
    test("up to a point, deeply nested clauses don't cause type errors", async () => {
        assertType(
            await db.findMany("user", {
                select: ["username"],
                include: {
                    tenants: {
                        select: ["name"],
                        orderBy: ["name"],
                        include: {
                            tenancies: {
                                select: ["id"],
                                where: { createdAt: { [$gt]: new Date() } },
                            },
                            users: {
                                select: ["username", "id"],
                                where: {
                                    id: "abc",
                                    deletedAt: { [$gt]: new Date() },
                                },
                                include: {
                                    tenants: {
                                        select: ["name"],
                                        where: {
                                            [$or]: [
                                                { name: "a" },
                                                { name: "b" },
                                                {
                                                    [$and]: [
                                                        {
                                                            [$or]: [
                                                                { name: "c" },
                                                                { name: "d" },
                                                            ],
                                                        },
                                                        {
                                                            [$or]: [
                                                                { name: "e" },
                                                                { name: "f" },
                                                            ],
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                        include: {
                                            tenancies: {
                                                select: ["id"],
                                                where: {
                                                    [$or]: [
                                                        {
                                                            createdAt: {
                                                                [$gt]: new Date(),
                                                            },
                                                        },
                                                        {
                                                            [$and]: [
                                                                {
                                                                    createdAt: {
                                                                        [$not]: null,
                                                                    },
                                                                },
                                                            ],
                                                        },
                                                    ],
                                                },
                                                include: {
                                                    tenant: {
                                                        select: ["id"],
                                                        where: {
                                                            name: "abc",
                                                        },
                                                        include: {
                                                            users: {
                                                                select: [
                                                                    "username",
                                                                ],
                                                                where: {
                                                                    username: {
                                                                        [$ilike]:
                                                                            "Russell",
                                                                    },
                                                                },
                                                            },
                                                            posts: {
                                                                select: [
                                                                    "id",
                                                                    "title",
                                                                ],
                                                                where: {
                                                                    publishedAt:
                                                                        {
                                                                            [$not]: null,
                                                                        },
                                                                },
                                                                include: {
                                                                    author: {
                                                                        select: [
                                                                            "id",
                                                                            "username",
                                                                        ],
                                                                        include:
                                                                            {
                                                                                posts: {
                                                                                    select: [
                                                                                        "id",
                                                                                        "title",
                                                                                    ],
                                                                                    where: {
                                                                                        publishedAt:
                                                                                            {
                                                                                                [$not]: null,
                                                                                            },
                                                                                    },
                                                                                },
                                                                            },
                                                                        where: {
                                                                            username:
                                                                                "Russell",
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                        orderBy: ["name"],
                                    },
                                },
                                orderBy: ["joinedAt"],
                            },
                        },
                    },
                },
            }),
        );
    });
});
