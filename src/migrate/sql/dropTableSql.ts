import pgfmt from "pg-format";
import { Model } from "~/types/schema";
import { SQLStatement } from "~/util/SQLStatement";

export const dropTableSql = (model: Model): SQLStatement => {
    const statement = pgfmt(
        "DROP TABLE IF EXISTS %I.%I CASCADE;",
        model.schema ?? "public",
        model.table,
    );
    return new SQLStatement(statement);
};
