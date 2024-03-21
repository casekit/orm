import pgfmt from "pg-format";
import { Model } from "~/types/schema";

export const dropTableSql = (model: Model) => {
    return pgfmt(
        "DROP TABLE IF EXISTS %I.%I CASCADE;",
        model.schema ?? "public",
        model.table,
    );
};
