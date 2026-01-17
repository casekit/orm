import { describe, test } from "vitest";

import { Models } from "@casekit/orm-fixtures";

import { OrderByClause } from "./OrderByClause.js";

describe("OrderByClause", () => {
    test("allows ordering by fields of the model", () => {
        const _: OrderByClause<Models, "post"> = ["title", "id"];
    });

    test("allows ordering by fields on N:1 relations", () => {
        const _: OrderByClause<Models, "post"> = ["author.name"];
    });

    test("allows specifying a direction", () => {
        const _: OrderByClause<Models, "post"> = [
            "title",
            "id",
            ["id", "desc"],
        ];
    });

    test("prevents ordering by non-existing fields", () => {
        const _: OrderByClause<Models, "post"> = [
            "title",
            // @ts-expect-error non-existent field
            "wrong",
        ];
    });

    test("prevents ordering by non-existing relations", () => {
        const _: OrderByClause<Models, "post"> = [
            "title",
            // @ts-expect-error non-existent relation
            "wrong.name",
        ];
    });

    test("prevents ordering by N:N relations", () => {
        const _: OrderByClause<Models, "user"> = [
            "name",
            // @ts-expect-error N:N relation
            "posts.title",
        ];
    });

    test("prevents ordering by 1:N relations", () => {
        const _: OrderByClause<Models, "user"> = [
            "name",
            // @ts-expect-error N:1 relation
            "posts.title",
        ];
    });
});
