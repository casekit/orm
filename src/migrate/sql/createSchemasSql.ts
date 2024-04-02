import { uniq } from "lodash-es";
import pgfmt from "pg-format";

import { Orm } from "../../orm";
import { SQLStatement } from "../../sql";
import { ModelDefinitions } from "../../types/schema/definition/ModelDefinitions";

export const createSchemasSql = <Models extends ModelDefinitions>(
    db: Orm<Models>,
): SQLStatement => {
    const schemas = uniq(Object.values(db.models).map((m) => m.schema));

    return new SQLStatement(
        schemas
            .map((s) => pgfmt("CREATE SCHEMA IF NOT EXISTS %I;", s))
            .join("\n"),
    );
};
