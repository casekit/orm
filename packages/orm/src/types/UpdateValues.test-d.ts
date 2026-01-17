import { describe, test } from "vitest";

import { Models } from "@casekit/orm-fixtures";

import { UpdateValues } from "./UpdateValues.js";

describe("UpdateValues", () => {
    test("all fields are optional", () => {
        const _: UpdateValues<Models["post"]> = {};
    });

    test("handles nullable fields", () => {
        const _: UpdateValues<Models["post"]> = {
            backgroundColorValue: null,
        };
    });

    test("handles arrays", () => {
        const _: UpdateValues<Models["post"]> = {
            tags: ["a", "b", "c"],
        };
    });

    test("handles jsonb fields", () => {
        const _: UpdateValues<Models["post"]> = {
            metadata: {
                foo: "a",
                bar: [
                    { baz: "good", quux: true },
                    { baz: "bad", quux: false },
                ],
            },
        };
    });

    test("rejects invalid field names", () => {
        const _: UpdateValues<Models["post"]> = {
            // @ts-expect-error invalid field
            invalid: "wrong",
        };
    });
});
