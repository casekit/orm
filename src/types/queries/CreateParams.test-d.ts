import { assertType, describe, expectTypeOf, test } from "vitest";
import { db } from "~/test/fixtures";

import { ColumnName } from "../schema/helpers/ColumnName";
import { Columns } from "../schema/helpers/Columns";
import { CreateParams, OptionalColumns } from "./CreateParams";

describe("OptionalColumns", () => {
    test("columns are optional if they are nullable, have a default value, or are of serial type", () => {
        expectTypeOf<ColumnName<typeof db, "post">>().toEqualTypeOf<"id">();
    });
});
