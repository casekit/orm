import { orm } from "@casekit/orm";

import { describe, expect, test } from "vitest";

import { populateModel } from "./schema/populateModel";
import { config, models } from "./test/fixtures";

describe("orm", () => {
    test("it creates an orm object that contains the model definitions with optional values populated", () => {
        const db = orm({ config, models });
        expect(db.schema.models.post).toEqual(
            populateModel(db.config, "post", models.post),
        );
    });

    test("the returned object has a findMany function", async () => {
        const db = orm({ config, models });
        expect(await db.findMany("post", { select: ["id"] })).toEqual([]);
    });
});
