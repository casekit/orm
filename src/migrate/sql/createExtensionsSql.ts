import pgfmt from "pg-format";

import { Orm } from "../../orm";
import { SQLStatement } from "../../sql";
import { Schema } from "../../types/schema";

export const createExtensionsSql = (db: Orm<Schema>): SQLStatement | null => {
    if (db.schema.extensions.length === 0) return null;

    return new SQLStatement(
        db.schema.extensions
            .map((e) => pgfmt("CREATE EXTENSION IF NOT EXISTS %I;", e))
            .join("\n"),
    );
};
