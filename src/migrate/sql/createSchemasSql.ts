import { uniq } from "lodash";
import pgfmt from "pg-format";

import { Orm } from "../../orm";
import { SQLStatement } from "../../sql";
import { Schema } from "../../types/schema";

export const createSchemasSql = (db: Orm<Schema>): SQLStatement => {
    const schemas = uniq(Object.values(db.models).map((m) => m.schema));

    return new SQLStatement(
        schemas
            .map((s) => pgfmt("CREATE SCHEMA IF NOT EXISTS %I;", s))
            .join("\n"),
    );
};
