import { uniq } from "lodash-es";
import pgfmt from "pg-format";

import { SQLStatement } from "../../sql";
import { BaseOrm } from "../../types/base/BaseOrm";

export const dropSchemasSql = (db: BaseOrm): SQLStatement => {
    const schemas = uniq(Object.values(db.models).map((m) => m.schema));

    return new SQLStatement(
        schemas
            .map((s) => pgfmt("DROP SCHEMA IF EXISTS %I CASCADE;", s))
            .join("\n"),
    );
};
