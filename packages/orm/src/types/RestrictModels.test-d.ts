import { describe, expectTypeOf, test } from "vitest";

import { config } from "@casekit/orm-fixtures";

import { RestrictModels } from "./RestrictModels.js";

describe("RestrictModels", () => {
    test("restricts relations to only allowed models", () => {
        expectTypeOf<
            keyof RestrictModels<typeof config, "user" | "post">["models"]
        >().toEqualTypeOf<"user" | "post">();
    });

    test("excludes relations to non-allowed models", () => {
        expectTypeOf<
            keyof RestrictModels<
                typeof config,
                "user" | "friendship"
            >["models"]["user"]["relations"]
        >().toEqualTypeOf<"friends" | "friendships">();

        expectTypeOf<
            keyof RestrictModels<
                typeof config,
                "user" | "post"
            >["models"]["post"]["relations"]
        >().toEqualTypeOf<"author">();

        expectTypeOf<
            RestrictModels<typeof config, "user">["models"]["user"]["relations"]
        >().toEqualTypeOf<undefined>();
    });

    test("N:N relations are excluded unless the through model is also allowed", () => {
        // @ts-expect-error - friendship model is not allowed
        const _: RestrictModels<
            typeof config,
            "user"
        >["models"]["user"]["relations"] = {
            friends: {
                type: "N:N",
                model: "user",
                through: {
                    model: "friendship",
                    fromRelation: "user",
                    toRelation: "friend",
                },
            },
        };
    });

    test("N:N relations are allowed if the through model is also allowed", () => {
        const _: RestrictModels<
            typeof config,
            "user" | "friendship"
        >["models"]["user"]["relations"] = {
            friends: {
                type: "N:N",
                model: "user",
                through: {
                    model: "friendship",
                    fromRelation: "user",
                    toRelation: "friend",
                },
            },
            friendships: {
                type: "1:N",
                model: "friendship",
                fromField: "id",
                toField: "userId",
            },
        };
    });
});
