import { describe, expectTypeOf, test } from "vitest";

import { Models, Operators } from "@casekit/orm-fixtures";

import { UpdateOneResult } from "./UpdateOneResult.js";

describe("UpdateOneResult", () => {
    test("returns count when no returning clause", () => {
        expectTypeOf<
            UpdateOneResult<
                Models,
                Operators,
                "post",
                {
                    set: { title: string };
                    where: { id: number };
                }
            >
        >().toEqualTypeOf<number>();
    });

    test("returns array of selected fields when returning clause present", () => {
        expectTypeOf<
            UpdateOneResult<
                Models,
                Operators,
                "post",
                {
                    set: { title: string };
                    where: { id: number };
                    returning: ["id", "title"];
                }
            >
        >().toEqualTypeOf<{
            id: number;
            title: string;
        }>();
    });

    test("handles complex field types", () => {
        expectTypeOf<
            UpdateOneResult<
                Models,
                Operators,
                "post",
                {
                    set: { title: string };
                    where: { id: number };
                    returning: ["tags", "deletedAt"];
                }
            >
        >().toEqualTypeOf<{
            tags: string[];
            deletedAt: Date | null;
        }>();
    });

    test("does not allow invalid field names in returning clause", () => {
        let _: UpdateOneResult<
            Models,
            Operators,
            "post",
            // @ts-expect-error invalid field
            {
                set: { title: string };
                where: { id: number };
                returning: ["id", "invalid"];
            }
        >;
    });
});
