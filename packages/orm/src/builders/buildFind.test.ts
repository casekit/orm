import { describe, expect, test } from "vitest";

import { createTestDB } from "../tests/util/db.js";
import { buildFind } from "./buildFind.js";

describe("buildFind", () => {
    const { db } = createTestDB();
    test("builds query with N:1 relation include", () => {
        const result = buildFind(db.config, [], "post", {
            select: ["id", "title"],
            include: {
                author: {
                    select: ["name", "id"],
                },
            },
        });

        expect(result).toEqual({
            table: {
                schema: "orm",
                name: "post",
                alias: "a",
                model: "post",
            },
            columns: [
                {
                    table: "a",
                    name: "id",
                    alias: "a_0",
                    path: ["id"],
                },
                {
                    table: "a",
                    name: "title",
                    alias: "a_1",
                    path: ["title"],
                },
                {
                    table: "b",
                    name: "name",
                    alias: "b_0",
                    path: ["author", "name"],
                },
                {
                    table: "b",
                    name: "id",
                    alias: "b_1",
                    path: ["author", "id"],
                },
            ],
            joins: [
                {
                    path: ["author"],
                    relation: "author",
                    orderBy: [],
                    type: "INNER",
                    table: {
                        schema: "orm",
                        name: "user",
                        alias: "b",
                        model: "user",
                    },
                    where: null,
                    columns: [
                        {
                            from: {
                                table: "a",
                                name: "author_id",
                            },
                            to: {
                                table: "b",
                                name: "id",
                            },
                        },
                    ],
                },
            ],
            where: null,
            orderBy: [],
            limit: undefined,
            offset: undefined,
            tableIndex: 2,
        });
    });

    test("builds query with optional N:1 relation include", () => {
        const { db } = createTestDB();

        const result = buildFind(db.config, [], "post", {
            select: ["id"],
            include: {
                backgroundColor: {
                    select: ["name"],
                },
            },
        });

        expect(result).toEqual({
            table: {
                schema: "orm",
                name: "post",
                alias: "a",
                model: "post",
            },
            columns: [
                {
                    table: "a",
                    name: "id",
                    alias: "a_0",
                    path: ["id"],
                },
                {
                    table: "b",
                    name: "name",
                    alias: "b_0",
                    path: ["backgroundColor", "name"],
                },
                {
                    table: "b",
                    name: "hex",
                    alias: "b_1",
                    path: ["backgroundColor", "hex"],
                },
            ],
            joins: [
                {
                    path: ["backgroundColor"],
                    relation: "backgroundColor",
                    orderBy: [],
                    type: "LEFT",
                    table: {
                        schema: "orm",
                        name: "color",
                        alias: "b",
                        model: "color",
                    },
                    where: null,
                    columns: [
                        {
                            from: {
                                table: "a",
                                name: "background_color_value",
                            },
                            to: {
                                table: "b",
                                name: "hex",
                            },
                        },
                    ],
                },
            ],
            where: null,
            orderBy: [],
            limit: undefined,
            offset: undefined,
            tableIndex: 2,
        });
    });

    test("automatically joins relations referenced in orderBy", () => {
        const { db } = createTestDB();

        const result = buildFind(db.config, [], "post", {
            select: ["id", "title"],
            orderBy: ["author.name"],
        });

        expect(result).toEqual({
            table: {
                schema: "orm",
                name: "post",
                alias: "a",
                model: "post",
            },
            columns: [
                {
                    table: "a",
                    name: "id",
                    alias: "a_0",
                    path: ["id"],
                },
                {
                    table: "a",
                    name: "title",
                    alias: "a_1",
                    path: ["title"],
                },
                {
                    table: "b",
                    name: "id",
                    alias: "b_0",
                    path: ["author", "id"],
                },
            ],
            joins: [
                {
                    relation: "author",
                    path: ["author"],
                    orderBy: [],
                    type: "INNER",
                    table: {
                        schema: "orm",
                        name: "user",
                        alias: "b",
                        model: "user",
                    },
                    where: null,
                    columns: [
                        {
                            from: {
                                table: "a",
                                name: "author_id",
                            },
                            to: {
                                table: "b",
                                name: "id",
                            },
                        },
                    ],
                },
            ],
            where: null,
            orderBy: [
                {
                    column: {
                        table: "b",
                        name: "name",
                    },
                    direction: "ASC",
                },
            ],
            limit: undefined,
            offset: undefined,
            tableIndex: 2,
        });
    });

    test("combines ordering, limits and offsets from nested queries", () => {
        const { db } = createTestDB();

        const result = buildFind(db.config, [], "post", {
            select: ["id"],
            limit: 10,
            offset: 5,
            orderBy: ["author.id"],
            include: {
                author: {
                    select: ["id"],
                    limit: 5,
                    offset: 10,
                    orderBy: [["name", "desc"]],
                },
            },
        });

        expect(result.limit).toBe(5); // Takes minimum of limits
        expect(result.offset).toBe(10); // Takes maximum of offsets
        expect(result.orderBy).toEqual([
            {
                column: {
                    table: "b",
                    name: "id",
                },
                direction: "ASC",
            },
            {
                column: {
                    table: "b",
                    name: "name",
                },
                direction: "DESC",
            },
        ]);
    });

    test("uses subquery for nested relations when parent relation is optional", () => {
        const { db } = createTestDB();

        const result = buildFind(db.config, [], "task", {
            select: ["id", "title"],
            include: {
                assignee: {
                    select: ["name"],
                    include: {
                        department: {
                            select: ["name"],
                        },
                    },
                },
            },
        });

        // The task.assignee relation is optional, so it should LEFT JOIN
        expect(result.joins[0]?.type).toBe("LEFT");

        // Because assignee is optional and has nested joins, it should
        // use a subquery to preserve LEFT JOIN semantics
        expect(result.joins[0]?.subquery).toBeDefined();
        expect(result.joins[0]?.subquery?.alias).toBe("b_subq");

        // The nested join (employee.department) should be inside the subquery
        expect(result.joins[0]?.subquery?.joins).toHaveLength(1);
        expect(result.joins[0]?.subquery?.joins[0]?.relation).toBe(
            "department",
        );
        expect(result.joins[0]?.subquery?.joins[0]?.type).toBe("INNER");

        // The columns should reference the subquery alias
        const assigneeColumns = result.columns.filter(
            (col) => col.path[0] === "assignee",
        );
        expect(assigneeColumns.every((col) => col.table === "b_subq")).toBe(
            true,
        );
    });
});
