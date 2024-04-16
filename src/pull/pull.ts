import fs from "fs";
import { camelCase } from "lodash-es";
import path from "path";
import pg from "pg";

import { getForeignKeys } from "./introspect/getForeignKeys";
import { getPrimaryKeys } from "./introspect/getPrimaryKeys";
import { getTables } from "./introspect/getTables";
import { getUniqueConstraints } from "./introspect/getUniqueConstraints";
import { renderModel } from "./render/renderModel";
import { renderModelsIndex } from "./render/renderModelsIndex";
import { renderRelations } from "./render/renderRelations";
import { renderRelationsIndex } from "./render/renderRelationsIndex";
import { format } from "./util/format";

export const pull = async (
    client: pg.Client,
    opts: { schema: string; outDir: string },
) => {
    const tables = await getTables(client, opts.schema);
    const primaryKeys = await getPrimaryKeys(client, opts.schema);
    const uniqueConstraints = await getUniqueConstraints(client, opts.schema);
    const foreignKeys = await getForeignKeys(client, opts.schema);

    fs.mkdirSync(path.resolve(opts.outDir, "models"), { recursive: true });

    for (const [table, columns] of Object.entries(tables)) {
        fs.writeFileSync(
            path.resolve(opts.outDir, "models", `${camelCase(table)}.model.ts`),
            await renderModel({
                table,
                columns,
                primaryKey: primaryKeys[table] ?? [],
                uniqueConstraints: uniqueConstraints[table] ?? [],
                foreignKeys: foreignKeys[table] ?? [],
            }),
            { encoding: "utf-8" },
        );
    }

    fs.writeFileSync(
        path.resolve(opts.outDir, "models.ts"),
        await renderModelsIndex(Object.keys(tables)),
        { encoding: "utf-8" },
    );

    for (const table of Object.keys(tables)) {
        fs.writeFileSync(
            path.resolve(
                opts.outDir,
                "models",
                `${camelCase(table)}.relations.ts`,
            ),
            await renderRelations({
                table,
                foreignKeys: foreignKeys,
            }),
            { encoding: "utf-8" },
        );
    }

    fs.writeFileSync(
        path.resolve(opts.outDir, "relations.ts"),
        await renderRelationsIndex(Object.keys(tables)),
        { encoding: "utf-8" },
    );

    fs.writeFileSync(
        path.resolve(opts.outDir, "index.ts"),
        await format(`
            import { orm } from "@casekit/orm";
            import { type Models, models } from "./models";
            import { type Relations, relations } from "./relations";
            import pg from "pg";

            export const db = orm({
                models,
                relations,
                connection: new pg.Pool(),
            });

            export type { Models, Relations };
        `),
        { encoding: "utf-8" },
    );
};
