import pgfmt from "pg-format";

import { SQLStatement } from "../../sql";
import { BaseOrm } from "../../types/base/BaseOrm";

export const createExtensionsSql = (db: BaseOrm): SQLStatement | null => {
    if (db.config.extensions?.length === 0) return null;

    return (
        new SQLStatement(
            db.config.extensions
                ?.map((e) => pgfmt("CREATE EXTENSION IF NOT EXISTS %I;", e))
                .join("\n"),
        ) ?? null
    );
};
