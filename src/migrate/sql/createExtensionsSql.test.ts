import { unindent } from "@casekit/unindent";

import { describe, expect, test } from "vitest";

import { orm } from "../../orm";
import { createExtensionsSql } from "./createExtensionsSql";

describe("createExtensionsSql", () => {
    test("it generates a CREATE EXTENSION command for each extension", () => {
        const db = orm({ extensions: ["uuid-ossp", "postgis"], models: {} });
        expect(createExtensionsSql(db)?.text).toEqual(unindent`
            CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
            CREATE EXTENSION IF NOT EXISTS postgis;
        `);
    });

    test("if no extensions are specified, it returns null", () => {
        const db = orm({ models: {} });
        expect(createExtensionsSql(db)).toEqual(null);
    });
});
