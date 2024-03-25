import fs from "fs";
import { camelCase } from "lodash-es";
import path from "path";
import pg from "pg";

import { getPrimaryKeys } from "./introspect/getPrimaryKeys";
import { getTables } from "./introspect/getTables";
import { getUniqueConstraints } from "./introspect/getUniqueConstraints";
import { renderModel } from "./render/renderModel";

export const pull = async (
    client: pg.Client,
    opts: { schema: string; outDir: string },
) => {
    const tables = await getTables(client, opts.schema);
    const primaryKeys = await getPrimaryKeys(client, opts.schema);
    const uniqueConstraints = await getUniqueConstraints(client, opts.schema);

    fs.mkdirSync(opts.outDir, { recursive: true });

    for (const [table, columns] of Object.entries(tables)) {
        fs.writeFileSync(
            path.resolve(opts.outDir, `${camelCase(table)}.ts`),
            await renderModel({
                table,
                columns,
                primaryKey: primaryKeys[table] ?? [],
                uniqueConstraints: uniqueConstraints[table] ?? [],
            }),
            { encoding: "utf-8" },
        );
    }
};
