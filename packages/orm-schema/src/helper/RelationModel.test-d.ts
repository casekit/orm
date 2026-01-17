import { describe, expectTypeOf, test } from "vitest";

import { ModelDefinitions } from "../definition/ModelDefinitions.js";
import { RelationModel } from "./RelationModel.js";

describe("RelationModel", () => {
    const models = {
        user: {
            fields: {},
            relations: {
                posts: {
                    type: "1:N",
                    model: "post",
                    fromField: "id",
                    toField: "authorId",
                },
                likedPosts: {
                    type: "N:N",
                    model: "post",
                    through: {
                        model: "like",
                        fromRelation: "user",
                        toRelation: "post",
                    },
                },
            },
        },
        post: {
            fields: {},
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
        },
        like: { fields: {} },
    } as const satisfies ModelDefinitions;

    test("looks up the correct relation model in the schema for N:1 relations", () => {
        expectTypeOf<RelationModel<typeof models, "post", "author">>().toExtend<
            typeof models.user
        >();
    });

    test("looks up the correct relation model in the schema for 1:N relations", () => {
        expectTypeOf<RelationModel<typeof models, "post", "likes">>().toExtend<
            typeof models.like
        >();
    });

    test("looks up the correct relation model in the schema for N:N relations", () => {
        expectTypeOf<
            RelationModel<typeof models, "user", "likedPosts">
        >().toExtend<typeof models.post>();
    });

    describe("errors", () => {
        test("looking up a non-existing relation causes an error", () => {
            expectTypeOf<
                // @ts-expect-error relation does not exist
                RelationModel<typeof models, "post", "posts">
            >().not.toExtend<typeof models.post>();
        });

        test("looking up a relation for a model that doesn't exist causes an error", () => {
            expectTypeOf<
                // @ts-expect-error model does not exist
                RelationModel<typeof models, "postx", "posts">
            >().not.toExtend<typeof models.post>();
        });
    });
});
