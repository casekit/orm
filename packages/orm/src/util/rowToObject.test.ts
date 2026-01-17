import { describe, expect, test } from "vitest";

import { SelectedColumn } from "#builders/types.js";
import { rowToObject } from "./rowToObject.js";

const columns: SelectedColumn[] = [
    {
        alias: "a_0",
        name: "id",
        path: ["id"],
        table: "a",
    },
    {
        alias: "a_1",
        name: "title",
        path: ["title"],
        table: "a",
    },
    {
        alias: "a_2",
        name: "content",
        path: ["content"],
        table: "a",
    },
    {
        alias: "b_0",
        name: "id",
        path: ["author", "id"],
        table: "b",
    },
    {
        alias: "b_1",
        name: "name",
        path: ["author", "name"],
        table: "b",
    },
    {
        alias: "c_0",
        name: "id",
        path: ["author", "bio", "id"],
        table: "c",
    },
    {
        alias: "c_1",
        name: "content",
        path: ["author", "bio", "content"],
        table: "c",
    },
];

describe("rowToObject", () => {
    test("it converts a flat row with column aliases into a nested object with original field names", () => {
        expect(
            rowToObject(
                {
                    a_0: 3,
                    a_1: "hello it me",
                    a_2: "a very long blog post",
                    b_0: 2,
                    b_1: "russell",
                    c_0: 5,
                    c_1: "i'm russell",
                },
                columns,
            ),
        ).toEqual({
            id: 3,
            title: "hello it me",
            content: "a very long blog post",
            author: {
                id: 2,
                name: "russell",
                bio: { id: 5, content: "i'm russell" },
            },
        });
    });
});
