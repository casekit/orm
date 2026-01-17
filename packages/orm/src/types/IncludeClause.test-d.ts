import { describe, expectTypeOf, test } from "vitest";

import { Models, Operators } from "@casekit/orm-fixtures";

import { IncludeClause } from "./IncludeClause.js";

describe("IncludeClause", () => {
    test("allows including relations with nested find params", () => {
        const _: IncludeClause<Models, Operators, "user"> = {
            posts: { select: ["id", "title"] },
            friends: { select: ["id", "name"] },
        };
    });

    test("allows deeply nested includes", () => {
        const _: IncludeClause<Models, Operators, "user"> = {
            posts: {
                select: ["id"],
                include: {
                    author: {
                        select: ["id", "name"],
                    },
                },
            },
        };
    });

    test("disallows invalid relations", () => {
        const _: IncludeClause<Models, Operators, "post"> = {
            // @ts-expect-error invalid relation
            invalid: { select: ["id"] },
        };
    });

    test("handles models with no relations", () => {
        expectTypeOf<never>().toEqualTypeOf<
            IncludeClause<Models, Operators, "color">
        >();
    });

    test("correctly types many-to-one relations", () => {
        const _: IncludeClause<Models, Operators, "post"> = {
            author: { select: ["id"] },
        };
    });

    test("correctly types one-to-many relations", () => {
        const _: IncludeClause<Models, Operators, "user"> = {
            posts: { select: ["id"] },
        };
    });

    test("correctly types many-to-many relations", () => {
        const _: IncludeClause<Models, Operators, "user"> = {
            friends: { select: ["id"] },
        };
    });

    test("requires valid select clause in nested find params", () => {
        const _: IncludeClause<Models, Operators, "post"> = {
            author: {
                // @ts-expect-error invalid field in select
                select: ["invalid"],
            },
        };
    });

    test("allows where clause in nested find params", () => {
        const _: IncludeClause<Models, Operators, "user"> = {
            posts: {
                select: ["id"],
                where: { id: 1 },
            },
        };
    });

    test("allows orderBy in nested find params", () => {
        const _: IncludeClause<Models, Operators, "user"> = {
            posts: {
                select: ["id"],
                orderBy: ["id"],
            },
        };
    });
});
