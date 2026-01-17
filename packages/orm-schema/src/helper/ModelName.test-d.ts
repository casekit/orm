import { describe, expectTypeOf, test } from "vitest";

import { ModelDefinitions } from "../definition/ModelDefinitions.js";
import { ModelName } from "./ModelName.js";

describe("ModelName", () => {
    test("it evaluates to a string union of the names of the models", () => {
        const models = {
            user: { fields: {} },
            post: { fields: {} },
            like: { fields: {} },
            comment: { fields: {} },
            mention: { fields: {} },
            color: { fields: {} },
        } as const satisfies ModelDefinitions;

        expectTypeOf<ModelName<typeof models>>().toEqualTypeOf<
            "user" | "post" | "like" | "comment" | "mention" | "color"
        >();
    });
});
