import { describe, expect, test } from "vitest";

import { parseCreateUniqueIndexStatement } from "./parseCreateUniqueIndexStatement";

describe("parseCreateUniqueIndexStatement", () => {
    test("it extracts out the index's columns and a condition if present", () => {
        const parsed = parseCreateUniqueIndexStatement(
            "CREATE UNIQUE INDEX field_value_field_id_ordinal ON casekit.field_value USING btree (field_id, ordinal) WHERE (deleted_at IS NULL)",
        );

        expect(parsed.columns).toEqual(["field_id", "ordinal"]);
        expect(parsed.where).toEqual("deleted_at IS NULL");
    });
});
