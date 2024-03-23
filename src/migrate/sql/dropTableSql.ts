import pgfmt from "pg-format";
import { SQLStatement } from "~/sql/SQLStatement";
import { Model } from "~/types/schema";

export const dropTableSql = (model: Model): SQLStatement => {
    const statement = pgfmt(
        "DROP TABLE IF EXISTS %I.%I CASCADE;",
        model.schema ?? "public",
        model.table,
    );
    return new SQLStatement(statement);
};
