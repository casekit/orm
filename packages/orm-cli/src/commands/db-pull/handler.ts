import { dir } from "console";
import { camelCase } from "es-toolkit/string";
import path from "path";

import { migrate } from "@casekit/orm-migrate";

import { Handler } from "#types.js";
import { createOrOverwriteFile } from "#util/createOrOverwriteFile.js";
import { loadConfig } from "#util/loadConfig.js";
import { prettify } from "#util/prettify.js";
import { generateModelsFile } from "../../generators/generateModelsFile.js";
import { builder } from "./options.js";
import { renderModel } from "./util/renderModel.js";

export const handler: Handler<typeof builder> = async (opts) => {
    const config = await loadConfig(opts);
    const schema =
        opts.schema.length > 0 ? opts.schema : [config.db.config.schema];

    try {
        console.log("Pulling schema from database");
        const tables = await migrate.pull(config.db, schema);

        console.log(`Found ${tables.length} tables`);

        // Generate model files for each table
        for (const table of tables) {
            console.log(`Generating model for table: ${table.name}`);
            const modelName = camelCase(table.name);
            const modelFile = await renderModel(table, tables);
            await createOrOverwriteFile(
                `${config.directory}/models/${modelName}.ts`,
                modelFile,
                opts.force,
            );
        }

        const modelsFile = generateModelsFile(
            tables.map((t) => camelCase(t.name)),
        );

        await createOrOverwriteFile(
            `${dir}/models/index.ts`,
            await prettify(
                path.join(process.cwd(), `${dir}/models/index.ts`),
                modelsFile,
            ),
            opts.force,
        );

        console.log("✅ Done");
    } catch (e) {
        console.error("Error pulling schema from database", e);
        process.exitCode = 1;
    }
};
