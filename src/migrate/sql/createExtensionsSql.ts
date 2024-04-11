import pgfmt from "pg-format";

import { BaseOrm } from "../../schema/types/base/BaseOrm";
import { SQLStatement } from "../../sql";

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
