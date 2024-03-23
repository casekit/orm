import { unindent } from "@casekit/unindent";

import { describe, expect, test } from "vitest";

import { SQLStatement } from "./SQLStatement";
import { sql } from "./sql";

describe("SQLStatement", () => {
    test("It can be created using the `sql` tagged template literal", () => {
        const title = "my first post";
        const statement = sql`select * from casekit.post where title = ${title}`;
        expect(statement).toBeInstanceOf(SQLStatement);
        expect(statement.text).toEqual(unindent`
            select * from casekit.post where title = $1
        `);
        expect(statement.values).toEqual(["my first post"]);
    });

    test("Other statement and SQL strings can be appended to it", () => {
        const title = "my first post";
        const content = "%cats%";
        const statement = sql`select *\n`;
        statement.push(
            "from casekit.post\n",
            sql`where title = ${title}\n`,
            "and 1 = 1\n",
            sql`and content ilike ${content}\n`,
            `limit 1`,
        );
        expect(statement).toBeInstanceOf(SQLStatement);
        expect(statement.text).toEqual(unindent`
            select *
            from casekit.post
            where title = $1
            and 1 = 1
            and content ilike $2
            limit 1
        `);
        expect(statement.values).toEqual(["my first post", "%cats%"]);
    });
});
