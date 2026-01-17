import * as prompts from "@inquirer/prompts";
import { vol } from "memfs";
import { beforeEach, describe, expect, test, vi } from "vitest";
import yargs from "yargs";

import { unindent } from "@casekit/unindent";

import { globalOptions } from "#options.js";
import { generateModel } from "./generate-model.js";

describe("orm generate model", () => {
    beforeEach(() => {
        vi.spyOn(process, "cwd").mockReturnValue(".");
        vol.fromJSON(
            {
                "app/db.server/models/index.ts": unindent`
                    import { user } from "./user";

                    export const models = {
                      user
                    };
                `,
                "app/db.server/models/user.ts": unindent`
                    import { type ModelDefinition, sql } from "@casekit/orm";

                    export const user = {
                        fields: {
                            id: { type: "uuid", primaryKey: true },
                            createdAt: { type: "timestamp", default: sql\`now()\` },
                            name: { type: "text" },
                        },
                    } as const satisfies ModelDefinition;
                `,
            },
            "/project",
        );
    });

    test("it generates a model file and updates the index", async () => {
        vi.spyOn(prompts, "confirm").mockResolvedValue(true);

        vi.spyOn(process, "cwd").mockReturnValue("/project");

        await yargs()
            .options(globalOptions)
            .command(generateModel)
            .parseAsync("model --name post");

        const modelFile = vol.readFileSync(
            "./app/db.server/models/post.ts",
            "utf8",
        ) as string;
        expect(modelFile.trim()).toEqual(unindent`
            import type { ModelDefinition } from "@casekit/orm";

            export const post = {
                fields: {},
            } as const satisfies ModelDefinition;
        `);

        const indexFile = vol.readFileSync(
            "./app/db.server/models/index.ts",
            "utf8",
        ) as string;

        expect(indexFile.trim()).toEqual(unindent`
            import { post } from "./post";
            import { user } from "./user";

            export const models = {
                post,
                user,
            };
        `);
    });
});
