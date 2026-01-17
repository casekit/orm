import { fs, vol } from "memfs";
import pg from "pg";
import { Unregister, register } from "tsx/esm/api";
import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";

import * as loadConfig from "#util/loadConfig.js";

vi.mock("fs");
vi.mock("prettier");
vi.mock("@inquirer/prompts");

let unregister: Unregister;

beforeAll(async () => {
    const client = new pg.Client();
    await client.connect();
    await client.query("DROP SCHEMA IF EXISTS orm_cli_test CASCADE");
    unregister = register();
});

afterAll(async () => {
    await unregister();
});

beforeEach(async () => {
    const path = "./orm.config.ts";
    const { default: config } = await import(path);
    await config.db.connect();
    process.on("exit", async function () {
        await config.db.close();
    });

    vi.spyOn(loadConfig, "loadConfig").mockResolvedValue(config);

    const originalFs: typeof fs = await vi.importActual("fs");
    const ormConfig = originalFs.readFileSync(
        "./src/test/orm.config.ts",
        "utf8",
    );
    const prettierConfig = originalFs.readFileSync(
        "../../.prettierrc.json",
        "utf8",
    );

    vol.fromJSON(
        { "orm.config.ts": ormConfig, ".prettierrc.json": prettierConfig },
        "/project",
    );

    vi.spyOn(process, "cwd").mockReturnValue("/project");
});

afterEach(() => {
    vol.reset();
});
