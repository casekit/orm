import { uniq } from "lodash-es";
import pgfmt from "pg-format";

import { BaseOrm } from "../../schema/types/base/BaseOrm";
import { SQLStatement } from "../../sql";

export const dropSchemasSql = (db: BaseOrm): SQLStatement => {
    const schemas = uniq(Object.values(db.models).map((m) => m.schema));

    return new SQLStatement(
        schemas
            .map((s) => pgfmt("DROP SCHEMA IF EXISTS %I CASCADE;", s))
            .join("\n"),
    );
};
