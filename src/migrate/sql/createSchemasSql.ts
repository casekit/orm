import { uniq } from "lodash-es";
import pgfmt from "pg-format";

import { BaseOrm } from "../../schema/types/base/BaseOrm";
import { SQLStatement } from "../../sql";

export const createSchemasSql = (db: BaseOrm): SQLStatement => {
    const schemas = uniq(Object.values(db.models).map((m) => m.schema));

    return new SQLStatement(
        schemas
            .map((s) => pgfmt("CREATE SCHEMA IF NOT EXISTS %I;", s))
            .join("\n"),
    );
};
