import { describe, test } from "vitest";

import { Models, Operators } from "@casekit/orm-fixtures";

import { $gt } from "#operators.js";
import { DeleteParams } from "./DeleteParams.js";

describe("DeleteParams", () => {
    test("minimal valid params with just where clause", () => {
        const _: DeleteParams<Models, Operators, "post"> = {
            where: { id: 1 },
        };
    });

    test("with returning clause", () => {
        const _: DeleteParams<Models, Operators, "post"> = {
            where: { id: 1 },
            returning: ["id", "title"],
        };
    });

    test("with complex where clause", () => {
        const _: DeleteParams<Models, Operators, "post"> = {
            where: { id: 1, title: "hello", publishedAt: null },
            returning: ["id"],
        };
    });

    test("invalid field in where clause", () => {
        const _: DeleteParams<Models, Operators, "post"> = {
            // @ts-expect-error invalid field
            where: { invalidField: "wrong" },
        };
    });

    test("invalid field in returning clause", () => {
        const _: DeleteParams<Models, Operators, "post"> = {
            where: { id: 1 },
            // @ts-expect-error invalid field
            returning: ["invalidField"],
        };
    });

    test("where clause is required", () => {
        // @ts-expect-error where clause is required
        const _: DeleteParams<Models, Operators, "post"> = {
            returning: ["id"],
        };
    });

    test("handles operators in where clause", () => {
        const _: DeleteParams<Models, Operators, "post"> = {
            where: { title: { [$gt]: "hello" } },
            returning: ["id"],
        };
    });
});
