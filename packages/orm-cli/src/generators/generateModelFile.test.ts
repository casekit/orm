import { vol } from "memfs";
import { beforeAll, describe, expect, test } from "vitest";

import { unindent } from "@casekit/unindent";

import { generateModelFile } from "./generateModelFile.js";

describe("generateModelFile", () => {
    beforeAll(() => {
        vol.fromJSON({}, "/project");
    });

    test("generates an empty model definition", async () => {
        const result = await generateModelFile("book", "./app/db.server");

        expect(result.trim()).toBe(unindent`
            import type { ModelDefinition } from "@casekit/orm";

            export const book = {
                fields: {},
            } as const satisfies ModelDefinition;
        `);
    });
});
