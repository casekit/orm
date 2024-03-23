import fs from "fs";
import { camelCase } from "lodash";
import path from "path";
import { Client } from "pg";

import { getPrimaryKeys } from "./getPrimaryKeys";
import { getTables } from "./getTables";
import { getUniqueConstraints } from "./getUniqueConstraints";
import { renderModel } from "./renderModel";

export const pull = async (
    client: Client,
    opts: { schema: string; outDir: string },
) => {
    const tables = await getTables(client, opts.schema);
    // eslint-disable-next-line
    const primaryKeys = await getPrimaryKeys(client, opts.schema);
    // eslint-disable-next-line
    const uniqueConstraints = await getUniqueConstraints(client, opts.schema);

    fs.mkdirSync(opts.outDir, { recursive: true });

    const imports = ["createModel"];
    if (
        Object.values(tables)
            .flat()
            .find((c) => c.default !== null)
    ) {
        imports.push("sql");
    }

    for (const [tablename, columns] of Object.entries(tables)) {
        fs.writeFileSync(
            path.resolve(opts.outDir, `${camelCase(tablename)}.ts`),
            renderModel(tablename, columns),
            { encoding: "utf-8" },
        );
    }
};
