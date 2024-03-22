import pgfmt from "pg-format";
import { Model } from "~/types/schema";
import { SQLFragment } from "~/util/SqlFragment";

export const dropTableSql = (model: Model): SQLFragment => {
    const sql = pgfmt(
        "DROP TABLE IF EXISTS %I.%I CASCADE;",
        model.schema ?? "public",
        model.table,
    );
    return new SQLFragment(sql);
};
