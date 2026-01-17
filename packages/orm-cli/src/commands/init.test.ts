import * as prompts from "@inquirer/prompts";
import { vol } from "memfs";
import { describe, expect, test, vi } from "vitest";
import yargs from "yargs";

import { unindent } from "@casekit/unindent";

import { init } from "./init.js";

describe("init", () => {
    test("scaffolding config files", async () => {
        vi.spyOn(prompts, "input").mockResolvedValueOnce("./app/db.server");
        vi.spyOn(prompts, "confirm").mockResolvedValueOnce(true);

        await yargs().command(init).parseAsync("init");

        const dbFile = vol.readFileSync("./app/db.server/index.ts", "utf-8");
        const modelFile = vol.readFileSync(
            "./app/db.server/models/index.ts",
            "utf-8",
        );
        const configFile = vol.readFileSync("./orm.config.ts", "utf-8");

        expect(dbFile).toEqual(unindent`
            import { type Config, type ModelType, type Orm, orm } from "@casekit/orm";
            import { models } from "./models";

            const config = {
                models,
            } as const satisfies Config;

            let db: Orm<typeof config>;

            declare global {
            	// eslint-disable-next-line no-var
            	var __db: Orm<typeof config>;
            }

            // we do this because in development we don't want to restart
            // the server with every change, but we want to make sure we don't
            // create a new connection to the DB with every change either.
            if (process.env.NODE_ENV === "production") {
            	db = orm(config);
            	await db.connect();
            } else {
            	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            	if (!global.__db) {
            		global.__db = orm(config);
            		await global.__db.connect();
            	}
            	db = global.__db;
            }

            export type DB = Orm<typeof config>;
            export type Models = typeof models;
            export type Model<M extends keyof Models> = ModelType<Models[M]>;

            export { db };
        `);

        expect((modelFile as string).trim()).toEqual(unindent`
            export const models = {};
        `);

        expect(configFile).toEqual(unindent`
            import { type Config, orm } from "@casekit/orm";
            import type { OrmCLIConfig } from "@casekit/orm-cli";

            import { models } from "./app/db.server/models";

            const config = {
                models,
            } as const satisfies Config;

            export default {
                db: orm(config),
                directory: "./app/db.server",
            } satisfies OrmCLIConfig;
        `);
    });

    test("optionally overwriting existing files", async () => {
        vol.fromJSON(
            {
                "package.json": JSON.stringify({ dependencies: {} }),
                "app/db.server/models/index.ts": "original",
                "orm.config.ts": "original",
                "app/db.server/index.ts": "original",
            },
            "/project",
        );

        vi.spyOn(prompts, "input").mockResolvedValueOnce("./app/db.server");
        vi.spyOn(prompts, "confirm")
            .mockResolvedValueOnce(true)
            .mockResolvedValueOnce(false)
            .mockResolvedValueOnce(false);

        await yargs().command(init).parseAsync("init");

        const dbFile = vol.readFileSync("./app/db.server/index.ts", "utf-8");
        const modelFile = vol.readFileSync(
            "./app/db.server/models/index.ts",
            "utf-8",
        );
        const configFile = vol.readFileSync("./orm.config.ts", "utf-8");

        expect(dbFile).toEqual(unindent`
            import { type Config, type ModelType, type Orm, orm } from "@casekit/orm";
            import { models } from "./models";

            const config = {
                models,
            } as const satisfies Config;

            let db: Orm<typeof config>;

            declare global {
            	// eslint-disable-next-line no-var
            	var __db: Orm<typeof config>;
            }

            // we do this because in development we don't want to restart
            // the server with every change, but we want to make sure we don't
            // create a new connection to the DB with every change either.
            if (process.env.NODE_ENV === "production") {
            	db = orm(config);
            	await db.connect();
            } else {
            	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            	if (!global.__db) {
            		global.__db = orm(config);
            		await global.__db.connect();
            	}
            	db = global.__db;
            }

            export type DB = Orm<typeof config>;
            export type Models = typeof models;
            export type Model<M extends keyof Models> = ModelType<Models[M]>;

            export { db };
        `);

        expect(modelFile).toEqual("original");
        expect(configFile).toEqual("original");
    });
});
