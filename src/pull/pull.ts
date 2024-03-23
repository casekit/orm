import { Client } from "pg";

import { getColumns } from "./getColumns";
import { getPrimaryKeys } from "./getPrimaryKeys";
import { getUniqueConstraints } from "./getUniqueConstraints";

export const pull = async (
    client: Client,
    opts: { schema: string; outDir: string },
) => {
    // eslint-disable-next-line
    const columns = await getColumns(client, opts.schema);
    // eslint-disable-next-line
    const primaryKeys = await getPrimaryKeys(client, opts.schema);
    // eslint-disable-next-line
    const uniqueConstraints = await getUniqueConstraints(client, opts.schema);
    return;
};
