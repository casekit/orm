import { DeepReadonly } from "ts-essentials";
import { describe, expectTypeOf, test } from "vitest";

import { $gt, $is, $like, $or } from "../operators.js";
import { createTestDB } from "./util/db.js";

describe("deleteMany", () => {
    const { db } = createTestDB();

    test("returns array of records when returning clause is specified", () => {
        expectTypeOf(
            db.deleteMany("post", {
                where: { id: 1 },
                returning: ["id", "title", "content"],
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

    test("returns number when no returning clause specified", () => {
        expectTypeOf(
            db.deleteMany("post", {
                where: { id: 1 },
            }),
        ).resolves.toEqualTypeOf<number>();
    });

    test("handles nullable fields in returning clause", () => {
        expectTypeOf(
            db.deleteMany("post", {
                where: { id: 1 },
                returning: ["deletedAt"],
            }),
        ).resolves.toEqualTypeOf<
            DeepReadonly<
                {
                    deletedAt: Date | null;
                }[]
            >
        >();
    });

    test("handles array fields in where and returning clauses", () => {
        expectTypeOf(
            db.deleteMany("post", {
                where: {
                    tags: ["news", "tech"],
                    id: 1,
                },
                returning: ["tags", "id"],
            }),
        ).resolves.toEqualTypeOf<
            DeepReadonly<
                {
                    readonly tags: readonly string[];
                    readonly id: number;
                }[]
            >
        >();
    });

    test("handles JSON fields in where and returning clauses", async () => {
        // Test returning JSON fields
        expectTypeOf(
            db.deleteMany("post", {
                where: { id: 1 },
                returning: ["metadata"],
            }),
        ).resolves.toEqualTypeOf<
            DeepReadonly<
                {
                    metadata: {
                        foo: "a" | "b" | "c";
                        bar: {
                            baz: "good" | "bad" | "indifferent";
                            quux: boolean;
                        }[];
                    };
                }[]
            >
        >();

        // Test user preferences JSON field
        expectTypeOf(
            db.deleteMany("user", {
                where: { id: 1 },
                returning: ["preferences"],
            }),
        ).resolves.toEqualTypeOf<
            DeepReadonly<
                {
                    preferences: unknown;
                }[]
            >
        >();

        expectTypeOf(
            db.deleteMany("post", {
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
                returning: ["metadata"],
            }),
        ).resolves.toEqualTypeOf<
            DeepReadonly<
                {
                    metadata: {
                        foo: "a" | "b" | "c";
                        bar: {
                            baz: "good" | "bad" | "indifferent";
                            quux: boolean;
                        }[];
                    };
                }[]
            >
        >();

        await db.deleteMany("post", {
            where: {
                metadata: {
                    // @ts-expect-error invalid enum value in JSON
                    foo: "invalid",
                    bar: [],
                },
            },
        });
    });

    test("handles complex where clauses", () => {
        expectTypeOf(
            db.deleteMany("post", {
                where: {
                    id: { [$gt]: 100 },
                    [$or]: [
                        { title: { [$like]: "test%" } },
                        { tags: ["news", "tech"] },
                    ],
                    publishedAt: { [$is]: null },
                },
                returning: ["id"],
            }),
        ).resolves.toEqualTypeOf<
            DeepReadonly<
                {
                    id: number;
                }[]
            >
        >();
    });

    test("enforces where clause is required", async () => {
        // @ts-expect-error where clause is required
        await db.deleteMany("post", {
            returning: ["id"],
        });
    });

    test("prevents invalid field names in where clause", async () => {
        await db.deleteMany("post", {
            where: {
                // @ts-expect-error invalid field name
                invalid: 1,
            },
        });
    });

    test("prevents invalid field names in returning clause", async () => {
        await db.deleteMany("post", {
            where: { id: 1 },
            // @ts-expect-error invalid field name
            returning: ["invalid"],
        });
    });

    test("prevents invalid model names", async () => {
        // @ts-expect-error invalid model name
        await db.deleteMany("invalid", {
            where: { id: 1 },
        });
    });

    test("prevents invalid operator usage", async () => {
        await db.deleteMany("post", {
            where: {
                // @ts-expect-error $like cannot be used with number
                id: { [$like]: 100 },
            },
        });
    });

    test("handles enum fields in where and returning clauses", async () => {
        // Test enum in where clause
        expectTypeOf(
            db.deleteMany("user", {
                where: { role: "admin" },
                returning: ["role", "id"],
            }),
        ).resolves.toEqualTypeOf<
            DeepReadonly<
                {
                    role: "user" | "admin";
                    id: number;
                }[]
            >
        >();

        // Test enum in JSON structure
        expectTypeOf(
            db.deleteMany("post", {
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
                returning: ["metadata"],
            }),
        ).resolves.toEqualTypeOf<
            DeepReadonly<
                {
                    metadata: {
                        foo: "a" | "b" | "c";
                        bar: {
                            baz: "good" | "bad" | "indifferent";
                            quux: boolean;
                        }[];
                    };
                }[]
            >
        >();

        await db.deleteMany("user", {
            where: {
                // @ts-expect-error invalid enum value for role
                role: "superadmin",
            },
        });

        await db.deleteMany("post", {
            where: {
                metadata: {
                    // @ts-expect-error invalid enum value in JSON metadata
                    foo: "invalid",
                    bar: [],
                },
            },
        });
    });

    test("enforces field type constraints in where clause", async () => {
        await db.deleteMany("post", {
            where: {
                // @ts-expect-error id must be number
                id: "1",
            },
        });

        await db.deleteMany("post", {
            where: {
                // @ts-expect-error tags must be string[]
                tags: "tag1",
            },
        });

        await db.deleteMany("user", {
            where: {
                // @ts-expect-error role must be "user" | "admin"
                role: "superuser",
            },
        });
    });

    test("returned arrays contain deeply readonly objects", async () => {
        const result = await db.deleteMany("post", {
            where: { id: 1 },
            returning: ["metadata"],
        });

        expectTypeOf(result).toEqualTypeOf<
            readonly {
                readonly metadata: {
                    readonly foo: "a" | "b" | "c";
                    readonly bar: readonly {
                        readonly baz: "good" | "bad" | "indifferent";
                        readonly quux: boolean;
                    }[];
                };
            }[]
        >();
    });
});
