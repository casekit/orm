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

    test("Interpolated fragments always end with a string even if a variable comes last", () => {
        const title = "my first post";
        const content = "%cats%";
        const statement = sql`select *\n`;
        statement.push(
            "from casekit.post\n",
            sql`where title = ${title}\n`,
            "and 1 = 1\n",
            sql`and content ilike ${content}`,
        );
        expect(statement).toBeInstanceOf(SQLStatement);
        expect(statement.text).toEqual(unindent`
            select *
            from casekit.post
            where title = $1
            and 1 = 1
            and content ilike $2
        `);
        expect(statement.fragments[statement.fragments.length - 1]).toEqual("");
    });

    test("Identifiers can be interpolated into the SQL string with the .withIdentifiers method", () => {
        const statement =
            sql`select * from %I.%I as %I where %I.%I = ${3}`.withIdentifiers(
                "casekit",
                "foo",
                "f",
                "f",
                "bar",
            );
        expect(statement.text).toEqual(
            `select * from casekit.foo as f where f.bar = $1`,
        );
    });

    test("Identifiers can be interpolated before and after parameters are included", () => {
        const statement =
            sql`select * from %I.%I as %I where %I.%I = ${3} and %I.%I = ${"baz"} and %I.%I in (${sql.splat(["quux", "zyzzy"])})`.withIdentifiers(
                "casekit",
                "foo",
                "f",
                "f",
                "bar",
                "f",
                "baz",
                "f",
                "quux",
            );
        expect(statement.text).toEqual(
            `select * from casekit.foo as f where f.bar = $1 and f.baz = $2 and f.quux in ($3, $4)`,
        );
        expect(statement.values).toEqual([3, "baz", "quux", "zyzzy"]);
    });

    test("Empty SQL statements can be interpolated inside SQLStatements", () => {
        const statement = sql`select * from (${sql`select * from casekit.foo where bar = ${3} and baz = ${"baz"}`}) zyzzy where quux in (${sql``})`;
        expect(statement.text).toEqual(
            `select * from (select * from casekit.foo where bar = $1 and baz = $2) zyzzy where quux in ()`,
        );
        expect(statement.values).toEqual([3, "baz"]);
    });

    test("sql.splat returns (NULL) given an empty array", () => {
        const statement = sql`select * from casekit.foo where bar in (${sql.splat([])})`;
        expect(statement.text).toEqual(
            `select * from casekit.foo where bar in (NULL)`,
        );
        expect(statement.values).toEqual([]);
    });

    test("sql.splat allows specifying a separator", () => {
        const clauses = [sql`foo = ${3}`, sql`bar = ${"baz"}`];
        const statement = sql`select * from casekit.foo where ${sql.splat(clauses, " and ")}`;
        expect(statement.text).toEqual(
            `select * from casekit.foo where foo = $1 and bar = $2`,
        );
        expect(statement.values).toEqual([3, "baz"]);
    });
});
