import { describe, test } from "vitest";

import { Models, Operators } from "@casekit/orm-fixtures";

import { $eq } from "#operators.js";
import { CountParams } from "./CountParams.js";

describe("CountParams", () => {
    test("empty params", () => {
        const _: CountParams<Models, Operators, "post"> = {};
    });

    test("with where clause", () => {
        const _: CountParams<Models, Operators, "post"> = {
            where: { id: { [$eq]: 1 } },
        };
    });

    test("with include clause", () => {
        const _: CountParams<Models, Operators, "post"> = {
            include: { author: {} },
        };
    });

    test("with nested include and where", () => {
        const _: CountParams<Models, Operators, "post"> = {
            include: {
                author: {
                    where: { id: { [$eq]: 1 } },
                },
            },
            where: { title: { [$eq]: "test" } },
        };
    });

    test("invalid relation in include", () => {
        const _: CountParams<Models, Operators, "post"> = {
            include: {
                // @ts-expect-error invalid relation
                invalidRelation: {
                    where: { id: { [$eq]: 1 } },
                },
            },
        };
    });

    test("invalid field in where clause", () => {
        const _: CountParams<Models, Operators, "post"> = {
            where: {
                // @ts-expect-error invalid field
                invalidField: { [$eq]: 1 },
            },
        };
    });

    test("include when model has no relations", () => {
        const _: CountParams<Models, Operators, "color"> = {
            where: { hex: { [$eq]: "#fff" } },
            // @ts-expect-error color has no relations
            include: {
                foo: {},
            },
        };
    });

    test("include when model has relations, but no N:1 relations", () => {
        const _: CountParams<Models, Operators, "user"> = {
            // @ts-expect-error models with no N:1 relations
            include: {
                friends: {
                    where: { id: { [$eq]: 1 } },
                },
            },
        };
    });

    test("non-N:1 relations are not allowed in include", () => {
        const _: CountParams<Models, Operators, "post"> = {
            include: {
                // @ts-expect-error N:1 relations are not allowed
                likes: {
                    where: { id: { [$eq]: 1 } },
                },
            },
        };
    });

    test("models with no N:1 relations don't allow include clauses", () => {
        const _: CountParams<Models, Operators, "user"> = {
            // @ts-expect-error N:N relations are not allowed
            include: {
                friends: {
                    where: { id: { [$eq]: 1 } },
                },
            },
        };
    });

    test("allows counting with a for update clause", () => {
        const _: CountParams<Models, Operators, "post"> = {
            for: "update",
        };
    });
});
