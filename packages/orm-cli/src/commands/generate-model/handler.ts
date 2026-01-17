import { camelCase } from "es-toolkit";
import fs from "fs";
import path from "path";

import { generateModelFile } from "#generators/generateModelFile.js";
import { generateModelsFile } from "#generators/generateModelsFile.js";
import { Handler } from "#types.js";
import { createOrOverwriteFile } from "#util/createOrOverwriteFile.js";
import { loadConfig } from "#util/loadConfig.js";
import { prettify } from "#util/prettify.js";
import { builder } from "./options.js";

export const handler: Handler<typeof builder> = async (opts) => {
    const config = await loadConfig(opts);

    const modelFile = await generateModelFile(opts.name, config.directory);
    await createOrOverwriteFile(
        `${config.directory}/models/${opts.name}.ts`,
        modelFile,
        opts.force,
    );

    const models = fs
        .readdirSync(`${config.directory}/models`)
        .filter((f) => f !== "index.ts")
        .map((f) => camelCase(f.replace(/\.ts$/, "")));

    await createOrOverwriteFile(
        `${config.directory}/models/index.ts`,
        await prettify(
            path.join(process.cwd(), `${config.directory}/models/index.ts`),
            generateModelsFile(models),
        ),
        opts.force,
    );
};
