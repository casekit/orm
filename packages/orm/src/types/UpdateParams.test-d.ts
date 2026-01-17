import { describe, test } from "vitest";

import { Models, Operators } from "@casekit/orm-fixtures";

import { UpdateParams } from "./UpdateParams.js";

describe("UpdateParams", () => {
    test("basic structure", () => {
        const _: UpdateParams<Models, Operators, "post"> = {
            set: { title: "hello world" },
            where: { authorId: 1 },
            returning: ["id", "title"],
        };
    });

    test("returning clause is optional", () => {
        const _: UpdateParams<Models, Operators, "post"> = {
            set: { content: "hello" },
            where: { id: 1 },
        };
    });

    test("handles complex field types", () => {
        const _: UpdateParams<Models, Operators, "post"> = {
            set: { tags: ["hello", "world"], deletedAt: null },
            where: { title: "hello" },
            returning: ["id", "tags", "deletedAt"],
        };
    });

    test("rejects invalid field names", () => {
        const _: UpdateParams<Models, Operators, "post"> = {
            // @ts-expect-error invalid field
            invalid: "wrong",
        };
    });
});
