import pgfmt from "pg-format";
import { Orm } from "~/orm";
import { Schema } from "~/types/schema";
import { SQLFragment } from "~/util/SQLFragment";

export const createExtensionsSql = (db: Orm<Schema>): SQLFragment | null => {
    if (db.schema.extensions.length === 0) return null;
    return new SQLFragment(
        db.schema.extensions
            .map((e) => pgfmt("CREATE EXTENSION IF NOT EXISTS %I;", e))
            .join("\n\n"),
    );
};
