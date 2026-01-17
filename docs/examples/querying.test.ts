/**
 * @fileoverview Examples from the Querying guide.
 * These examples are tested to ensure they work correctly.
 */

import {
    $and,
    $gte,
    $ilike,
    $in,
    $is,
    $or
} from "@casekit/orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { cleanupDb, getDb, resetDb, type DB } from "./setup.js";

describe("Querying Examples", () => {
    let db: DB;

    beforeAll(async () => {
        db = await getDb();
    });

    afterAll(async () => {
        await cleanupDb();
    });

    beforeEach(async () => {
        await resetDb();
        // Seed data for querying examples
        await db.createMany("author", {
            values: [
                { name: "Jane Austen", email: "jane@example.com" },
                { name: "Charles Dickens", email: "charles@example.com" },
                { name: "Virginia Woolf", email: "virginia@example.com" },
                { name: "Ernest Hemingway", email: "ernest@example.com" },
            ],
        });
    });

    // -------------------------------------------------------------------------
    // example: select-fields
    // -------------------------------------------------------------------------
    it("select specific fields", async () => {
        // [start: select-fields]
        const authors = await db.findMany("author", {
            select: ["id", "name"],
        });
        // [end: select-fields]

        expect(authors).toHaveLength(4);
        // Only selected fields are returned
        expect(Object.keys(authors[0])).toEqual(["id", "name"]);
    });

    // -------------------------------------------------------------------------
    // example: where-equality
    // -------------------------------------------------------------------------
    it("filter with equality", async () => {
        // [start: where-equality]
        const author = await db.findOne("author", {
            select: ["id", "name", "email"],
            where: { name: "Jane Austen" },
        });
        // [end: where-equality]

        expect(author.email).toBe("jane@example.com");
    });

    // -------------------------------------------------------------------------
    // example: where-operators
    // -------------------------------------------------------------------------
    it("filter with comparison operators", async () => {
        // Setup: add some books with different IDs
        const jane = await db.findOne("author", {
            select: ["id"],
            where: { name: "Jane Austen" },
        });

        await db.createMany("book", {
            values: [
                { title: "Pride and Prejudice", authorId: jane.id },
                { title: "Sense and Sensibility", authorId: jane.id },
                { title: "Emma", authorId: jane.id },
            ],
        });

        // [start: where-operators]
        const books = await db.findMany("book", {
            select: ["id", "title"],
            where: {
                id: { [$gte]: 1 },
            },
            orderBy: [["title", "asc"]],
        });
        // [end: where-operators]

        expect(books).toHaveLength(3);
    });

    // -------------------------------------------------------------------------
    // example: where-in
    // -------------------------------------------------------------------------
    it("filter with IN operator", async () => {
        // [start: where-in]
        const authors = await db.findMany("author", {
            select: ["id", "name"],
            where: {
                name: { [$in]: ["Jane Austen", "Virginia Woolf"] },
            },
        });
        // [end: where-in]

        expect(authors).toHaveLength(2);
    });

    // -------------------------------------------------------------------------
    // example: where-like
    // -------------------------------------------------------------------------
    it("filter with LIKE operator", async () => {
        // [start: where-like]
        const authors = await db.findMany("author", {
            select: ["id", "name"],
            where: {
                email: { [$ilike]: "%example.com" },
            },
        });
        // [end: where-like]

        expect(authors).toHaveLength(4);
    });

    // -------------------------------------------------------------------------
    // example: where-null
    // -------------------------------------------------------------------------
    it("filter with NULL check", async () => {
        // Setup: add bio to one author
        await db.updateMany("author", {
            set: { bio: "A famous writer" },
            where: { name: "Jane Austen" },
        });

        // [start: where-null]
        const authorsWithBio = await db.findMany("author", {
            select: ["id", "name", "bio"],
            where: {
                bio: { [$is]: null },
            },
        });
        // [end: where-null]

        expect(authorsWithBio).toHaveLength(3);
    });

    // -------------------------------------------------------------------------
    // example: where-or
    // -------------------------------------------------------------------------
    it("filter with OR logic", async () => {
        // [start: where-or]
        const authors = await db.findMany("author", {
            select: ["id", "name"],
            where: {
                [$or]: [{ name: "Jane Austen" }, { name: "Virginia Woolf" }],
            },
        });
        // [end: where-or]

        expect(authors).toHaveLength(2);
    });

    // -------------------------------------------------------------------------
    // example: where-and
    // -------------------------------------------------------------------------
    it("filter with AND logic", async () => {
        // [start: where-and]
        const authors = await db.findMany("author", {
            select: ["id", "name", "email"],
            where: {
                [$and]: [
                    { email: { [$ilike]: "%example.com" } },
                    { name: { [$ilike]: "%a%" } },
                ],
            },
        });
        // [end: where-and]

        // Jane Austen, Charles Dickens, Virginia Woolf, Ernest Hemingway
        // All have 'a' in their name
        expect(authors.length).toBeGreaterThanOrEqual(1);
    });

    // -------------------------------------------------------------------------
    // example: order-by
    // -------------------------------------------------------------------------
    it("order results", async () => {
        // [start: order-by]
        const authors = await db.findMany("author", {
            select: ["id", "name"],
            orderBy: [
                ["name", "asc"], // Primary sort
            ],
        });
        // [end: order-by]

        expect(authors[0].name).toBe("Charles Dickens");
        expect(authors[authors.length - 1].name).toBe("Virginia Woolf");
    });

    // -------------------------------------------------------------------------
    // example: limit-offset
    // -------------------------------------------------------------------------
    it("paginate results", async () => {
        // [start: limit-offset]
        const page1 = await db.findMany("author", {
            select: ["id", "name"],
            orderBy: [["name", "asc"]],
            limit: 2,
            offset: 0,
        });

        const page2 = await db.findMany("author", {
            select: ["id", "name"],
            orderBy: [["name", "asc"]],
            limit: 2,
            offset: 2,
        });
        // [end: limit-offset]

        expect(page1).toHaveLength(2);
        expect(page2).toHaveLength(2);
        expect(page1[0].name).not.toBe(page2[0].name);
    });

    // -------------------------------------------------------------------------
    // example: count
    // -------------------------------------------------------------------------
    it("count records", async () => {
        // [start: count]
        const totalAuthors = await db.count("author", {
            where: {},
        });

        const authorsWithA = await db.count("author", {
            where: { name: { [$ilike]: "%a%" } },
        });
        // [end: count]

        expect(totalAuthors).toBe(4);
        expect(authorsWithA).toBeGreaterThan(0);
    });
});
