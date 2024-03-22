import { unindent } from "@casekit/unindent";

import { describe, expect, test } from "vitest";

import { SQLFragment } from "./SqlFragment";
import { sql } from "./sql";

describe("SQLFragment", () => {
    test("It can be created using the `sql` tagged template literal", () => {
        const title = "my first post";
        const fragment = sql`select * from casekit.post where title = ${title}`;
        expect(fragment).toBeInstanceOf(SQLFragment);
        expect(fragment.toQuery()).toEqual([
            unindent`
        select * from casekit.post where title = $1
        `,
            ["my first post"],
        ]);
    });

    test("Other fragments and SQL strings can be appended to it", () => {
        const title = "my first post";
        const content = "%cats%";
        const fragment = sql`select *\n`;
        fragment.push(
            "from casekit.post\n",
            sql`where title = ${title}\n`,
            "and 1 = 1\n",
            sql`and content ilike ${content}\n`,
            `limit 1`,
        );
        expect(fragment).toBeInstanceOf(SQLFragment);
        expect(fragment.toQuery()).toEqual([
            unindent`
            select *
            from casekit.post
            where title = $1
            and 1 = 1
            and content ilike $2
            limit 1
            `,
            ["my first post", "%cats%"],
        ]);
    });

    test("The start index for variables can be overriden", () => {
        const title = "my first post";
        const content = "%cats%";
        const fragment = sql`select *\n`;
        fragment.push(
            "from casekit.post\n",
            sql`where title = ${title}\n`,
            "and 1 = 1\n",
            sql`and content ilike ${content}\n`,
            `limit 1`,
        );
        expect(fragment).toBeInstanceOf(SQLFragment);
        expect(fragment.toQuery({ variableIndex: 2 })).toEqual([
            unindent`
            select *
            from casekit.post
            where title = $2
            and 1 = 1
            and content ilike $3
            limit 1
            `,
            ["my first post", "%cats%"],
        ]);
    });
});
