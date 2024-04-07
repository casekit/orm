import pgfmt from "pg-format";

import { SQLStatement } from "../../sql";
import { BaseModel } from "../../types/schema/BaseModel";

export const dropTableSql = (model: BaseModel): SQLStatement => {
    const statement = pgfmt(
        "DROP TABLE IF EXISTS %I.%I CASCADE;",
        model.schema ?? "public",
        model.table,
    );
    return new SQLStatement(statement);
};
