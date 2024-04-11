import pgfmt from "pg-format";

import { BaseModel } from "../../schema/types/base/BaseModel";
import { SQLStatement } from "../../sql";

export const dropTableSql = (model: BaseModel): SQLStatement => {
    const statement = pgfmt(
        "DROP TABLE IF EXISTS %I.%I CASCADE;",
        model.schema ?? "public",
        model.table,
    );
    return new SQLStatement(statement);
};
