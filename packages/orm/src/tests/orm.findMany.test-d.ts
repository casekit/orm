import { DeepReadonly } from "ts-essentials";
import { describe, expectTypeOf, test } from "vitest";

import { $and, $gt, $is, $like, $or } from "../operators.js";
import { createTestDB } from "./util/db.js";

describe("orm.findMany", () => {
    const { db } = createTestDB();

    test("handles basic select fields", () => {
        expectTypeOf(
            db.findMany("post", {
                select: ["id", "title", "content"],
            }),
        ).resolves.toEqualTypeOf<
            DeepReadonly<
                {
                    id: number;
                    title: string;
                    content: string;
                }[]
            >
        >();
    });

    test("handles array fields in select and where clauses", async () => {
        expectTypeOf(
            db.findMany("post", {
                select: ["tags"],
                where: {
                    tags: ["news", "tech"],
                },
            }),
        ).resolves.toEqualTypeOf<
            DeepReadonly<
                {
                    tags: readonly string[];
                }[]
            >
        >();

        await db.findMany("post", {
            select: ["id"],
            where: {
                // @ts-expect-error tags must be string array
                tags: "not-an-array",
            },
        });
    });

    test("handles enum fields in select and where clauses", async () => {
        expectTypeOf(
            db.findMany("user", {
                select: ["role"],
                where: {
                    role: "admin",
                },
            }),
        ).resolves.toEqualTypeOf<
            DeepReadonly<
                {
                    role: "user" | "admin";
                }[]
            >
        >();

        await db.findMany("user", {
            select: ["id"],
            where: {
                // @ts-expect-error invalid enum value
                role: "superadmin",
            },
        });
    });

    test("handles JSON fields in select and where clauses", async () => {
        expectTypeOf(
            db.findMany("post", {
                select: ["metadata"],
                where: {
                    metadata: {
                        foo: "a",
                        bar: [
                            {
                                baz: "good",
                                quux: true,
                            },
                        ],
                    },
                },
            }),
        ).resolves.toEqualTypeOf<
            DeepReadonly<
                {
                    metadata: {
                        foo: "a" | "b" | "c";
                        bar: readonly {
                            baz: "good" | "bad" | "indifferent";
                            quux: boolean;
                        }[];
                    };
                }[]
            >
        >();

        await db.findMany("post", {
            select: ["id"],
            where: {
                metadata: {
                    // @ts-expect-error invalid JSON structure
                    foo: "invalid",
                    bar: [
                        {
                            // @ts-expect-error invalid JSON structure
                            baz: "invalid",
                            // @ts-expect-error invalid JSON structure
                            quux: "not-a-boolean",
                        },
                    ],
                },
            },
        });
    });

    test("handles deeply nested where clauses with logical operators", () => {
        expectTypeOf(
            db.findMany("post", {
                select: ["id"],
                where: {
                    [$and]: [
                        {
                            [$or]: [
                                {
                                    [$and]: [
                                        {
                                            [$or]: [
                                                {
                                                    [$and]: [
                                                        {
                                                            [$or]: [
                                                                {
                                                                    [$and]: [
                                                                        {
                                                                            [$or]: [
                                                                                {
                                                                                    [$and]: [
                                                                                        {
                                                                                            [$or]: [
                                                                                                {
                                                                                                    [$and]: [
                                                                                                        {
                                                                                                            [$or]: [
                                                                                                                {
                                                                                                                    [$and]: [
                                                                                                                        {
                                                                                                                            [$or]: [
                                                                                                                                {
                                                                                                                                    [$and]: [
                                                                                                                                        {
                                                                                                                                            [$or]: [
                                                                                                                                                {
                                                                                                                                                    title: {
                                                                                                                                                        [$like]:
                                                                                                                                                            "test%",
                                                                                                                                                    },
                                                                                                                                                    id: {
                                                                                                                                                        [$gt]: 100,
                                                                                                                                                    },
                                                                                                                                                },
                                                                                                                                            ],
                                                                                                                                        },
                                                                                                                                    ],
                                                                                                                                },
                                                                                                                            ],
                                                                                                                        },
                                                                                                                    ],
                                                                                                                },
                                                                                                            ],
                                                                                                        },
                                                                                                    ],
                                                                                                },
                                                                                            ],
                                                                                        },
                                                                                    ],
                                                                                },
                                                                            ],
                                                                        },
                                                                    ],
                                                                },
                                                            ],
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            }),
        ).resolves.toEqualTypeOf<
            DeepReadonly<
                {
                    id: number;
                }[]
            >
        >();
    });

    test("handles deeply nested includes", async () => {
        const result = await db.findMany("user", {
            select: ["id"],
            include: {
                // Level 1: user -> posts
                posts: {
                    select: ["id"],
                    include: {
                        // Level 2: posts -> author
                        author: {
                            select: ["id"],
                            include: {
                                // Level 3: author -> posts
                                posts: {
                                    select: ["id"],
                                    include: {
                                        // Level 4: posts -> author
                                        author: {
                                            select: ["id"],
                                            include: {
                                                // Level 5: author -> posts
                                                posts: {
                                                    select: ["id"],
                                                    include: {
                                                        // Level 6: posts -> author
                                                        author: {
                                                            select: ["id"],
                                                            include: {
                                                                // Level 7: author -> posts
                                                                posts: {
                                                                    select: [
                                                                        "id",
                                                                    ],
                                                                    include: {
                                                                        // Level 8: posts -> author
                                                                        author: {
                                                                            select: [
                                                                                "id",
                                                                            ],
                                                                            include:
                                                                                {
                                                                                    // Level 9: author -> posts
                                                                                    posts: {
                                                                                        select: [
                                                                                            "id",
                                                                                        ],
                                                                                        include:
                                                                                            {
                                                                                                // Level 10: posts -> author
                                                                                                author: {
                                                                                                    select: [
                                                                                                        "id",
                                                                                                    ],
                                                                                                    include:
                                                                                                        {
                                                                                                            // Level 11: author -> posts
                                                                                                            posts: {
                                                                                                                select: [
                                                                                                                    "id",
                                                                                                                ],
                                                                                                                include:
                                                                                                                    {
                                                                                                                        // Level 12: posts -> author
                                                                                                                        author: {
                                                                                                                            select: [
                                                                                                                                "id",
                                                                                                                            ],
                                                                                                                            include:
                                                                                                                                {
                                                                                                                                    // Level 13: author -> friends and author -> posts
                                                                                                                                    friends:
                                                                                                                                        {
                                                                                                                                            select: [
                                                                                                                                                "id",
                                                                                                                                                "name",
                                                                                                                                            ],
                                                                                                                                            include:
                                                                                                                                                {
                                                                                                                                                    posts: {
                                                                                                                                                        select: [
                                                                                                                                                            "id",
                                                                                                                                                            "title",
                                                                                                                                                            "tags",
                                                                                                                                                        ],
                                                                                                                                                        include:
                                                                                                                                                            {
                                                                                                                                                                // Level 14: posts -> backgroundColor
                                                                                                                                                                backgroundColor:
                                                                                                                                                                    {
                                                                                                                                                                        select: [
                                                                                                                                                                            "hex",
                                                                                                                                                                            "name",
                                                                                                                                                                        ],
                                                                                                                                                                    },
                                                                                                                                                            },
                                                                                                                                                    },
                                                                                                                                                },
                                                                                                                                        },
                                                                                                                                    posts: {
                                                                                                                                        select: [
                                                                                                                                            "id",
                                                                                                                                            "title",
                                                                                                                                            "tags",
                                                                                                                                        ],
                                                                                                                                        include:
                                                                                                                                            {
                                                                                                                                                // Level 14: posts -> backgroundColor
                                                                                                                                                backgroundColor:
                                                                                                                                                    {
                                                                                                                                                        select: [
                                                                                                                                                            "hex",
                                                                                                                                                            "name",
                                                                                                                                                        ],
                                                                                                                                                    },
                                                                                                                                            },
                                                                                                                                    },
                                                                                                                                },
                                                                                                                        },
                                                                                                                    },
                                                                                                            },
                                                                                                        },
                                                                                                },
                                                                                            },
                                                                                    },
                                                                                },
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        expectTypeOf(
            result[0]!.posts[0]!.author.posts[0]!.author.posts[0]!.author
                .posts[0]!.author.posts[0]!.author.posts[0]!.author.friends[0]!
                .posts[0]!.backgroundColor,
        ).toEqualTypeOf<
            DeepReadonly<{
                hex: string;
                name: string;
            } | null>
        >();

        expectTypeOf(
            result[0]!.posts[0]!.author.posts[0]!.author.posts[0]!.author
                .posts[0]!.author.posts[0]!.author.posts[0]!.author.friends[0]!,
        ).toEqualTypeOf<
            DeepReadonly<{
                id: number;
                name: string;
                posts: {
                    id: number;
                    title: string;
                    tags: string[];
                    backgroundColor: {
                        hex: string;
                        name: string;
                    } | null;
                }[];
            }>
        >();
    });

    test("handles complex combinations of fields, operators and includes", () => {
        expectTypeOf(
            db.findMany("post", {
                select: ["id", "title", "content", "tags", "metadata"],
                where: {
                    [$or]: [
                        {
                            title: { [$like]: "test%" },
                            tags: ["news"],
                            metadata: {
                                foo: "a",
                                bar: [{ baz: "good", quux: true }],
                            },
                        },
                        {
                            publishedAt: { [$is]: null },
                            authorId: { [$gt]: 100 },
                        },
                    ],
                },
                include: {
                    author: {
                        select: ["id", "role"],
                        include: {
                            posts: {
                                select: ["id"],
                            },
                        },
                    },
                    backgroundColor: {
                        select: ["hex", "name"],
                    },
                },
            }),
        ).resolves.toEqualTypeOf<
            DeepReadonly<
                {
                    id: number;
                    title: string;
                    content: string;
                    tags: readonly string[];
                    metadata: {
                        foo: "a" | "b" | "c";
                        bar: readonly {
                            baz: "good" | "bad" | "indifferent";
                            quux: boolean;
                        }[];
                    };
                    author: {
                        id: number;
                        role: "user" | "admin";
                        posts: {
                            id: number;
                        }[];
                    };
                    backgroundColor: {
                        hex: string;
                        name: string;
                    } | null;
                }[]
            >
        >();
    });

    test("enforces select clause is required", async () => {
        // @ts-expect-error select is required
        await db.findMany("post", {
            where: {
                id: 1,
            },
        });
    });

    test("prevents invalid field names in select clause", async () => {
        await db.findMany("post", {
            // @ts-expect-error invalid field name
            select: ["invalid"],
            where: {
                id: 1,
            },
        });
    });

    test("prevents invalid field names in where clause", async () => {
        await db.findMany("post", {
            select: ["id"],
            where: {
                // @ts-expect-error invalid field name
                invalid: 1,
            },
        });
    });

    test("prevents invalid model names", async () => {
        // @ts-expect-error invalid model name
        await db.findMany("invalid", {
            select: ["id"],
        });
    });

    test("prevents invalid relation names in include", async () => {
        await db.findMany("post", {
            select: ["id"],
            include: {
                // @ts-expect-error invalid relation name
                invalid: {
                    select: ["id"],
                },
            },
        });
    });

    test("prevents invalid operator usage", async () => {
        await db.findMany("post", {
            select: ["id"],
            where: {
                // @ts-expect-error $like cannot be used with number
                id: { [$like]: 100 },
            },
        });
    });
});
