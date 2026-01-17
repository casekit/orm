import { describe, expect, test } from "vitest";
import { z } from "zod";

import { unindent } from "@casekit/unindent";

import { SQLStatement, sql } from "./sql.js";

describe("sql", () => {
    test("simple string", () => {
        const statement = sql`SELECT 1 FROM dual`;
        expect(statement.text).toEqual("SELECT 1 FROM dual");
        expect(statement.values).toEqual([]);
    });

    test("interpolating a variable", () => {
        const statement = sql`SELECT ${1} FROM dual`;
        expect(statement.text).toEqual("SELECT $1 FROM dual");
        expect(statement.values).toEqual([1]);
    });

    test("interpolating null adds it literally rather than as a parameter", () => {
        const statement = sql`SELECT ${null} FROM dual`;
        expect(statement.text).toEqual("SELECT NULL FROM dual");
        expect(statement.values).toEqual([]);
    });

    test("interpolating true and false adds them literally rather than as a parameter", () => {
        const statement = sql`SELECT ${true}, ${false} FROM dual`;
        expect(statement.text).toEqual("SELECT TRUE, FALSE FROM dual");
        expect(statement.values).toEqual([]);
    });

    test("interpolating multiple variables", () => {
        const statement = sql`
                SELECT title FROM posts
                WHERE author = ${`Stewart Home`}
                AND likes > ${10}
            `;
        expect(statement.text).toEqual(unindent`
                SELECT title FROM posts
                WHERE author = $1
                AND likes > $2
            `);
        expect(statement.values).toEqual(["Stewart Home", 10]);
    });

    test("interpolating an array", () => {
        const statement = sql`
                SELECT title FROM posts
                WHERE author IN (${["Stewart Home", "Kathy Acker"]})
                AND likes > ${10}
            `;
        expect(statement.values).toEqual(["Stewart Home", "Kathy Acker", 10]);
        expect(statement.text).toEqual(unindent`
                SELECT title FROM posts
                WHERE author IN ($1, $2)
                AND likes > $3
            `);
    });

    test("interpolating an array with no values", () => {
        const statement = sql`
                SELECT title FROM posts
                WHERE author IN (${[]})
                AND likes > ${10}
            `;
        expect(statement.text).toEqual(unindent`
                SELECT title FROM posts
                WHERE author IN (NULL)
                AND likes > $1
            `);
        expect(statement.values).toEqual([10]);
    });

    test("interpolating a sql fragment", () => {
        const subquery = sql`
                SELECT id, title FROM posts
                WHERE author = ${"J.G. Ballard"}
            `;
        const statement = sql`
                SELECT u.username, p.title
                FROM users u
                WHERE u.favourite_post_id IN (${subquery}) p
                AND u.signed_up_at < ${new Date("2021-01-01")}
            `;
        expect(statement.text).toEqual(unindent`
                SELECT u.username, p.title
                FROM users u
                WHERE u.favourite_post_id IN (
                SELECT id, title FROM posts
                WHERE author = $1
            ) p
                AND u.signed_up_at < $2
            `);
        expect(statement.values).toEqual([
            "J.G. Ballard",
            new Date("2021-01-01"),
        ]);
    });

    test("interpolating an array of SQLStatements", () => {
        const fragments = [sql`${"axolotl"}::text`, sql`${"binturong"}`];

        const statement = sql`
                INSERT INTO animals (name) VALUES (${fragments})
            `;
        expect(statement.text).toEqual(unindent`
                INSERT INTO animals (name) VALUES ($1::text, $2)
            `);
        expect(statement.values).toEqual(["axolotl", "binturong"]);
    });

    test("interpolating an mixed array of SQLStatements and scalar values", () => {
        const fragments = [sql`${"axolotl"}::text`, 3, sql`${"binturong"}`];

        const statement = sql`
                INSERT INTO animals (name) VALUES (${fragments})
            `;
        expect(statement.text).toEqual(unindent`
                INSERT INTO animals (name) VALUES ($1::text, $2, $3)
            `);
        expect(statement.values).toEqual(["axolotl", 3, "binturong"]);
    });

    test("interpolating multiple levels of nesting of SQLStatements", () => {
        const fragments = [sql`${"axolotl"}::text`, 3, sql`${"binturong"}`];

        const subquery1 = sql`
            SELECT id, name FROM animals WHERE name IN (${fragments})
        `;
        const subquery2 = sql`
            SELECT id FROM animals
            WHERE id IN (${subquery1})
            AND name IN (${fragments})
        `;

        const statement = sql`
            SELECT id FROM animals
            WHERE id IN (${subquery2})
        `;
        expect(statement.pretty).toEqual(unindent`
            SELECT
                id
            FROM
                animals
            WHERE
                id IN (
                    SELECT
                        id
                    FROM
                        animals
                    WHERE
                        id IN (
                            SELECT
                                id,
                                name
                            FROM
                                animals
                            WHERE
                                name IN ($1::text, $2, $3)
                        )
                        AND name IN ($4::text, $5, $6)
                )
        `);
        expect(statement.values).toEqual([
            "axolotl",
            3,
            "binturong",
            "axolotl",
            3,
            "binturong",
        ]);
    });
});

describe("sql.array", () => {
    test("interpolating an array without expanding it", () => {
        const statement = sql`
                INSERT INTO animals (name) VALUES (${sql.array(["axolotl", "binturong"])})
            `;
        expect(statement.text).toEqual(unindent`
                INSERT INTO animals (name) VALUES ($1)
            `);
        expect(statement.values).toEqual([["axolotl", "binturong"]]);
    });
});

describe("sql.ident", () => {
    test("interpolating a simple identifier", () => {
        const statement = sql`
                SELECT ${sql.ident("title")} FROM posts
            `;
        expect(statement.text).toEqual(unindent`
                SELECT "title" FROM posts
            `);
        expect(statement.values).toEqual([]);
    });

    test("interpolating a mixed-case identifier", () => {
        const statement = sql`
                SELECT ${sql.ident("createdBy")} FROM posts
            `;
        expect(statement.text).toEqual(unindent`
                SELECT "createdBy" FROM posts
            `);
        expect(statement.values).toEqual([]);
    });

    test("interpolating a malicious identifier", () => {
        const statement = sql`
                SELECT ${sql.ident("'; delete from users;\"delete from posts")} FROM posts
            `;
        expect(statement.text).toEqual(unindent`
                SELECT "'; delete from users;""delete from posts" FROM posts
            `);
        expect(statement.values).toEqual([]);
    });
});

describe("sql.literal", () => {
    test("interpolating a simple literal", () => {
        const statement = sql`
            SELECT * FROM posts WHERE title = ${sql.literal("hello")}
        `;
        expect(statement.text).toEqual(unindent`
            SELECT * FROM posts WHERE title = 'hello'
        `);
        expect(statement.values).toEqual([]);
    });

    test("interpolating a literal with quotes", () => {
        const statement = sql`
            SELECT ${sql.literal("O'Reilly")} FROM authors
        `;
        expect(statement.text).toEqual(unindent`
            SELECT 'O''Reilly' FROM authors
        `);
        expect(statement.values).toEqual([]);
    });
});

describe("sql.join", () => {
    test("joining zero statements", () => {
        const statement = sql.join([]);
        expect(statement.text).toEqual("");
        expect(statement.values).toEqual([]);
    });

    test("joining one statement", () => {
        const statement = sql.join([sql`name = ${"axolotl"}`]);
        expect(statement.text).toEqual("name = $1");
        expect(statement.values).toEqual(["axolotl"]);
    });

    test("joining two statements", () => {
        const statement = sql.join(
            [sql`name = ${"axolotl"}`, sql`name = ${"binturong"}`],
            " OR ",
        );
        expect(statement.text).toEqual("name = $1 OR name = $2");
        expect(statement.values).toEqual(["axolotl", "binturong"]);
    });

    test("joining identifiers", () => {
        const statement = sql.join(["name", "age"].map(sql.ident), " AND ");
        expect(statement.text).toEqual(`"name" AND "age"`);
        expect(statement.values).toEqual([]);
    });

    test("passing a schema as an argument to the template tag", () => {
        const statement = sql(
            z.object({ title: z.string() }),
        )`SELECT ${sql.ident("title")} FROM ${sql.ident("posts")}`;

        expect(statement.schema).toBeInstanceOf(z.ZodObject);
        expect(statement.text).toEqual(unindent`
            SELECT "title" FROM "posts"
        `);
    });

    test("append allows appending another SQL fragment using the tagged template literal style", () => {
        const statement = sql`
            SELECT title FROM posts
            WHERE likes > ${10}
        `;

        statement.append`AND author = ${"Stewart Home"}`;

        expect(statement.pretty).toEqual(unindent`
            SELECT
                title
            FROM
                posts
            WHERE
                likes > $1
                AND author = $2
        `);

        expect(statement.values).toEqual([10, "Stewart Home"]);
    });

    test("appending to an empty SQLStatement", () => {
        const statement = new SQLStatement();

        statement.append`SELECT title FROM posts`;

        expect(statement.pretty).toEqual(unindent`
            SELECT
                title
            FROM
                posts
        `);
    });
});
