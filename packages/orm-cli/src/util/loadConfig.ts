import dotenv from "dotenv";
import path from "path";
import { register } from "tsx/esm/api";

import { globalOptions } from "#options.js";
import { CommandOptions, OrmCLIConfig } from "#types.js";

export const loadConfig = async (
    options: CommandOptions<typeof globalOptions>,
): Promise<OrmCLIConfig> => {
    try {
        dotenv.config();
        const unregister = register();
        const { default: config } = await import(
            path.join(process.cwd(), options.config)
        );
        await unregister();
        const c = "default" in config ? config.default : config;
        await c.db.connect();
        process.on("exit", async function () {
            await c.db.close();
        });

        return c;
    } catch (e) {
        console.error(e instanceof Error ? e.message : e);
        process.exit(1);
    }
};
