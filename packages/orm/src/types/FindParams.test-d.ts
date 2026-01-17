import { describe, test } from "vitest";

import { Models, Operators } from "@casekit/orm-fixtures";

import { $eq } from "#operators.js";
import { FindParams } from "./FindParams.js";

describe("FindParams", () => {
    test("minimal valid params with just select", () => {
        const _: FindParams<Models, Operators, "post"> = {
            select: ["id"],
        };
    });

    test("with include clause", () => {
        const _: FindParams<Models, Operators, "post"> = {
            select: ["id", "title"],
            include: { author: { select: ["id", "name"] } },
        };
    });

    test("with where clause", () => {
        const _: FindParams<Models, Operators, "post"> = {
            select: ["id"],
            where: { id: { [$eq]: 1 } },
        };
    });

    test("with limit and offset", () => {
        const _: FindParams<Models, Operators, "post"> = {
            select: ["id"],
            limit: 10,
            offset: 5,
        };
    });

    test("with order by", () => {
        const _: FindParams<Models, Operators, "post"> = {
            select: ["id"],
            orderBy: [["id", "asc"]],
        };
    });

    test("with all optional parameters", () => {
        const _: FindParams<Models, Operators, "post"> = {
            select: ["id", "title"],
            include: { author: { select: ["id"] } },
            where: { id: { [$eq]: 1 } },
            limit: 10,
            offset: 5,
            orderBy: [["id", "desc"], "author.name"],
        };
    });

    test("invalid field in select", () => {
        const _: FindParams<Models, Operators, "post"> = {
            // @ts-expect-error invalid field
            select: ["id", "invalid"],
        };
    });

    test("invalid relation in include", () => {
        const _: FindParams<Models, Operators, "post"> = {
            select: ["id"],
            include: {
                // @ts-expect-error invalid relation
                invalid: { select: ["id"] },
            },
        };
    });

    test("invalid field in where clause", () => {
        const _: FindParams<Models, Operators, "post"> = {
            select: ["id"],
            where: {
                // @ts-expect-error invalid field
                invalid: { [$eq]: 1 },
            },
        };
    });

    test("invalid field in order by", () => {
        const _: FindParams<Models, Operators, "post"> = {
            select: ["id"],
            orderBy: [
                "id",
                // @ts-expect-error invalid field
                "invalid",
            ],
        };
    });

    test("invalid direction in order by", () => {
        const _: FindParams<Models, Operators, "post"> = {
            select: ["id"],
            orderBy: [
                // @ts-expect-error invalid direction
                ["id", "invalid"],
            ],
        };
    });

    test("include when model has no relations", () => {
        const _: FindParams<Models, Operators, "color"> = {
            select: ["hex"],
            // @ts-expect-error color has no relations
            include: { posts: { select: ["id"] } },
        };
    });

    test("allows selecting for update clause", () => {
        const _: FindParams<Models, Operators, "post"> = {
            select: ["id"],
            for: "update",
        };
    });

    test("invalid `for` clause", () => {
        const _: FindParams<Models, Operators, "post"> = {
            select: ["id"],
            // @ts-expect-error invalid for clause
            for: "invalid",
        };
    });
});
