import { uniq } from "lodash";
import pgfmt from "pg-format";
import { Orm } from "~/orm";
import { Schema } from "~/types/schema";
import { SQLFragment } from "~/util/SqlFragment";

export const createSchemasSql = (db: Orm<Schema>): SQLFragment => {
    const schemas = uniq(Object.values(db.models).map((m) => m.schema));

    return new SQLFragment(
        schemas
            .map((s) => pgfmt("CREATE SCHEMA IF NOT EXISTS %I;", s))
            .join("\n\n"),
    );
};
