// orm.restrict.test-d.ts
import { DeepReadonly } from "ts-essentials";
import { assertType, describe, expectTypeOf, test } from "vitest";

import { models } from "@casekit/orm-fixtures";

import { orm } from "../orm.js";

const db = orm({ models });

describe("restrict types", () => {
    test("allows querying allowed models", () => {
        const restricted = db.restrict(["user", "post"]);

        // Should allow querying user model
        assertType(
            restricted.findOne("user", {
                select: ["id", "name"],
            }),
        );

        // Should allow querying post model with relation to allowed model
        assertType(
            restricted.findOne("post", {
                select: ["id", "title"],
                include: {
                    author: { select: ["id", "name"] },
                },
            }),
        );
    });

    test("prevents querying disallowed models", () => {
        const restricted = db.restrict(["user"]);

        assertType(
            // @ts-expect-error - post model is not allowed
            restricted.findOne("post", {
                select: ["id", "title"],
            }),
        );
    });

    test("prevents querying disallowed relations", () => {
        const restricted = db.restrict(["user", "friendship"]);

        assertType(
            restricted.findOne("user", {
                select: ["id", "name"],
                include: {
                    // @ts-expect-error post model is not allowed
                    posts: { select: ["id", "title"] },
                },
            }),
        );
    });

    test("allowing through model also allows N:N relations", () => {
        const restricted = db.restrict(["user", "friendship"]);

        assertType(
            restricted.findOne("user", {
                select: ["id", "name"],
                include: {
                    friends: { select: ["id", "name"] },
                },
            }),
        );

        expectTypeOf(
            restricted.findOne("user", {
                select: ["id", "name"],
                include: {
                    friends: { select: ["id", "name"] },
                },
            }),
        ).resolves.toEqualTypeOf<
            DeepReadonly<{
                id: number;
                name: string;
                friends: {
                    id: number;
                    name: string;
                }[];
            }>
        >();
    });

    test("restricting a model such that it has no relations prevents any include clauses on that model", () => {
        const restricted = db.restrict(["user"]);

        assertType(
            restricted.findOne("user", {
                select: ["id", "name"],
                // @ts-expect-error user has no allowed relations
                include: {
                    posts: { select: ["id", "title"] },
                },
            }),
        );
    });
    test("disallowing through model prevents N:N relations", () => {
        const restricted = db.restrict(["user", "post"]);

        assertType(
            restricted.findOne("user", {
                select: ["id", "name"],
                include: {
                    // @ts-expect-error friendship is not allowed
                    friends: { select: ["id", "name"] },
                },
            }),
        );
    });

    test("respects return types of queries on restricted orm", () => {
        const restricted = db.restrict(["user"]);

        expectTypeOf(
            restricted.findOne("user", {
                select: ["id", "name", "role"],
            }),
        ).resolves.toEqualTypeOf<
            DeepReadonly<{
                id: number;
                name: string;
                role: "user" | "admin";
            }>
        >();
    });

    test("restricting twice maintains most restrictive set", () => {
        const restricted = db.restrict(["user", "post"]).restrict(["user"]);

        // Should allow user queries
        assertType(
            restricted.findOne("user", {
                select: ["id", "name"],
            }),
        );

        // Should prevent post queries
        assertType(
            // @ts-expect-error - post model is not allowed after second restriction
            restricted.findOne("post", {
                select: ["id", "title"],
            }),
        );
    });

    test("empty restriction set creates unusable orm", () => {
        const restricted = db.restrict([]);

        assertType(
            // @ts-expect-error - no models are allowed
            restricted.findOne("user", {
                select: ["id", "name"],
            }),
        );

        assertType(
            // @ts-expect-error - no models are allowed
            restricted.findOne("post", {
                select: ["id", "title"],
            }),
        );
    });
});
