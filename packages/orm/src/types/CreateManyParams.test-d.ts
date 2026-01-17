import { describe, test } from "vitest";

import { Models } from "@casekit/orm-fixtures";

import { CreateManyParams } from "./CreateManyParams.js";

describe("CreateManyParams", () => {
    test("creating a single value", () => {
        const _: CreateManyParams<Models, "post"> = {
            values: [
                {
                    title: "Hello world!",
                    content: "My first post",
                    authorId: 1,
                },
            ],
            returning: ["id"],
        };
    });

    test("creating multiple values", () => {
        const _: CreateManyParams<Models, "post"> = {
            values: [
                {
                    title: "Hello world!",
                    content: "My first post",
                    authorId: 1,
                },
                {
                    title: "Hello world!",
                    content: "My first post",
                    authorId: 1,
                },
            ],
            returning: ["id"],
        };
    });

    test("without a returning clause", () => {
        const _: CreateManyParams<Models, "post"> = {
            values: [
                {
                    title: "Hello world!",
                    content: "My first post",
                    authorId: 1,
                },
            ],
        };
    });

    test("with on conflict behaviour specified", () => {
        const _: CreateManyParams<Models, "post"> = {
            values: [
                {
                    title: "Hello world!",
                    content: "My first post",
                    authorId: 1,
                },
            ],
            onConflict: { do: "nothing" },
        };
    });

    test("invalid field in values", () => {
        const _: CreateManyParams<Models, "post"> = {
            values: [
                {
                    title: "Hello world!",
                    content: "My first post",
                    // @ts-expect-error invalid field
                    invalid: "wrong",
                },
            ],
        };
    });

    test("invalid field in returning clause", () => {
        const _: CreateManyParams<Models, "post"> = {
            values: [
                {
                    title: "Hello world!",
                    content: "My first post",
                    authorId: 1,
                },
            ],
            returning: [
                "id",
                // @ts-expect-error invalid field
                "wrong",
            ],
        };
    });
});
