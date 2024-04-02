import { uniq } from "lodash-es";
import pgfmt from "pg-format";

import { Orm } from "../../orm";
import { SQLStatement } from "../../sql";
import { ModelDefinitions } from "../../types/schema/definition/ModelDefinitions";

export const dropSchemasSql = <Models extends ModelDefinitions>(
    db: Orm<Models>,
): SQLStatement => {
    const schemas = uniq(Object.values(db.models).map((m) => m.schema));

    return new SQLStatement(
        schemas
            .map((s) => pgfmt("DROP SCHEMA IF EXISTS %I CASCADE;", s))
            .join("\n"),
    );
};
