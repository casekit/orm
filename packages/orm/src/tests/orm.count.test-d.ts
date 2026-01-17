import { describe, expectTypeOf, test } from "vitest";

import { $in, $like } from "../operators.js";
import { createTestDB } from "./util/db.js";

describe("orm.count", () => {
    const { db } = createTestDB();

    test("returns number type for basic count", () => {
        expectTypeOf(db.count("post", {})).resolves.toBeNumber();
    });

    test("returns number type with where clause", () => {
        expectTypeOf(
            db.count("post", {
                where: {
                    title: "Test Post",
                },
            }),
        ).resolves.toBeNumber();
    });

    test("returns number type with complex where clause", () => {
        expectTypeOf(
            db.count("post", {
                where: {
                    title: { [$like]: "%Test%" },
                    id: { [$in]: [1, 2, 3] },
                },
            }),
        ).resolves.toBeNumber();
    });

    test("returns number type with include clause", () => {
        expectTypeOf(
            db.count("post", {
                include: {
                    author: {
                        where: {
                            name: { [$like]: "John%" },
                        },
                    },
                },
            }),
        ).resolves.toBeNumber();
    });

    test("returns number type with for clause", () => {
        expectTypeOf(
            db.count("post", {
                for: "update",
            }),
        ).resolves.toBeNumber();
    });

    test("type error for invalid model name", async () => {
        // @ts-expect-error Invalid model name
        await db.count("nonexistent", {});
    });

    test("type error for invalid field in where clause", async () => {
        // @ts-expect-error Invalid field
        await db.count("post", { where: { nonexistentField: "value" } });
    });

    test("type error for invalid relation in include", async () => {
        // @ts-expect-error Invalid relation
        await db.count("post", { include: { nonexistentRelation: {} } });
    });

    test("type error for non-N:1 relation in include", async () => {
        // @ts-expect-error Only N:1 relations can be included
        await db.count("post", { include: { likes: {} } });
    });

    test("type error for invalid value in for clause", async () => {
        // @ts-expect-error Invalid for value
        await db.count("post", { for: "invalid" });
    });
});
