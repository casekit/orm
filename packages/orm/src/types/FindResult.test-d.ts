import { describe, expectTypeOf, test } from "vitest";

import { Models, Operators } from "@casekit/orm-fixtures";

import { FindResult } from "./FindResult.js";

describe("FindResult", () => {
    test("simple select fields", () => {
        expectTypeOf<
            FindResult<Models, Operators, "post", { select: ["id", "title"] }>
        >().toEqualTypeOf<{
            id: number;
            title: string;
        }>();
    });

    test("many-to-one relation returns single object", () => {
        expectTypeOf<
            FindResult<
                Models,
                Operators,
                "post",
                {
                    select: ["id"];
                    include: { author: { select: ["id", "name"] } };
                }
            >
        >().toEqualTypeOf<{
            id: number;
            author: {
                id: number;
                name: string;
            };
        }>();
    });

    test("one-to-many relation returns array", () => {
        expectTypeOf<
            FindResult<
                Models,
                Operators,
                "user",
                {
                    select: ["id"];
                    include: { posts: { select: ["id", "title"] } };
                }
            >
        >().toEqualTypeOf<{
            id: number;
            posts: {
                id: number;
                title: string;
            }[];
        }>();
    });

    test("many-to-many relation returns array", () => {
        expectTypeOf<
            FindResult<
                Models,
                Operators,
                "user",
                {
                    select: ["id", "name"];
                    include: { friends: { select: ["id", "name"] } };
                }
            >
        >().toEqualTypeOf<{
            id: number;
            name: string;
            friends: {
                id: number;
                name: string;
            }[];
        }>();
    });

    test("optional many-to-one relation can be null", () => {
        expectTypeOf<
            FindResult<
                Models,
                Operators,
                "post",
                {
                    select: ["id", "title"];
                    include: { backgroundColor: { select: ["hex", "name"] } };
                }
            >
        >().toEqualTypeOf<{
            id: number;
            title: string;
            backgroundColor: { hex: string; name: string } | null;
        }>();
    });

    test("nested relations", () => {
        expectTypeOf<
            FindResult<
                Models,
                Operators,
                "post",
                {
                    select: ["id"];
                    include: {
                        author: {
                            select: ["id"];
                            include: {
                                posts: {
                                    select: ["title"];
                                };
                            };
                        };
                    };
                }
            >
        >().toEqualTypeOf<{
            id: number;
            author: {
                id: number;
                posts: {
                    title: string;
                }[];
            };
        }>();
    });

    test("array fields", () => {
        expectTypeOf<
            FindResult<Models, Operators, "post", { select: ["id", "tags"] }>
        >().toEqualTypeOf<{
            id: number;
            tags: string[];
        }>();
    });

    test("nullable fields", () => {
        expectTypeOf<
            FindResult<
                Models,
                Operators,
                "post",
                { select: ["id", "deletedAt"] }
            >
        >().toEqualTypeOf<{
            id: number;
            deletedAt: Date | null;
        }>();
    });

    test("without include clause", () => {
        expectTypeOf<
            FindResult<Models, Operators, "post", { select: ["id"] }>
        >().toEqualTypeOf<{
            id: number;
        }>();
    });
});
