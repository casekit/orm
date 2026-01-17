import { input } from "@inquirer/prompts";
import fs from "fs";
import path from "path";

import { generateConfigFile } from "#generators/generateConfigFile.js";
import { generateDbFile } from "#generators/generateDbFile.js";
import { generateModelsFile } from "#generators/generateModelsFile.js";
import { Handler } from "#types.js";
import { createOrOverwriteFile } from "#util/createOrOverwriteFile.js";
import { prettify } from "#util/prettify.js";
import { builder } from "./options.js";

export const handler: Handler<typeof builder> = async (opts) => {
    const srcDir = ["src", "app", "lib"].find(fs.existsSync) ?? "src";
    const dir =
        opts.directory ??
        (await input({
            message: "Where do you want to keep your database configuration?",
            default: `./${srcDir}/db.server`,
        }));

    const dbFile = generateDbFile();
    await createOrOverwriteFile(`${dir}/index.ts`, dbFile, opts.force);

    const modelsFile = generateModelsFile([]);
    await createOrOverwriteFile(
        `${dir}/models/index.ts`,
        await prettify(
            path.join(process.cwd(), `${dir}/models/index.ts`),
            modelsFile,
        ),
        opts.force,
    );

    const configFile = generateConfigFile(dir);
    await createOrOverwriteFile(`orm.config.ts`, configFile, opts.force);
};
