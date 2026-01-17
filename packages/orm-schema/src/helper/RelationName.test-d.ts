import { describe, expectTypeOf, test } from "vitest";

import { ModelDefinition } from "../definition/ModelDefinition.js";
import { RelationName } from "./RelationName.js";

describe("RelationName", () => {
    test("it evaluates to a string union of the names of the model's relations", () => {
        const user = {
            fields: { id: { type: "serial" } },
            relations: {
                posts: {
                    type: "1:N",
                    model: "post",
                    fromField: "id",
                    toField: "authorId",
                },
                friends: {
                    type: "N:N",
                    model: "user",
                    through: {
                        model: "friendship",
                        fromRelation: "user",
                        toRelation: "friend",
                    },
                },
            },
        } as const satisfies ModelDefinition;

        expectTypeOf<RelationName<typeof user>>().toEqualTypeOf<
            "posts" | "friends"
        >();

        const post = {
            fields: { id: { type: "serial" } },
            relations: {
                author: {
                    type: "N:1",
                    model: "user",
                    fromField: "authorId",
                    toField: "id",
                },
                likes: {
                    type: "1:N",
                    model: "like",
                    fromField: "id",
                    toField: "postId",
                },
            },
        } as const satisfies ModelDefinition;
        expectTypeOf<RelationName<typeof post>>().toEqualTypeOf<
            "author" | "likes"
        >();
    });
});
