/**
 * @fileoverview Examples from the Mutations guide.
 * These examples are tested to ensure they work correctly.
 */

import { $in } from "@casekit/orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { cleanupDb, getDb, resetDb, type DB } from "./setup.js";

describe("Mutations Examples", () => {
    let db: DB;

    beforeAll(async () => {
        db = await getDb();
    });

    afterAll(async () => {
        await cleanupDb();
    });

    beforeEach(async () => {
        await resetDb();
    });

    // -------------------------------------------------------------------------
    // example: create-one
    // -------------------------------------------------------------------------
    it("create a single record", async () => {
        // [start: create-one]
        const author = await db.createOne("author", {
            values: {
                name: "Jane Austen",
                email: "jane@example.com",
                bio: "English novelist",
            },
            returning: ["id", "name", "createdAt"],
        });
        // [end: create-one]

        expect(author.id).toBeTypeOf("number");
        expect(author.name).toBe("Jane Austen");
        expect(author.createdAt).toBeInstanceOf(Date);
    });

    // -------------------------------------------------------------------------
    // example: create-many
    // -------------------------------------------------------------------------
    it("create multiple records", async () => {
        // [start: create-many]
        const authors = await db.createMany("author", {
            values: [
                { name: "Jane Austen", email: "jane@example.com" },
                { name: "Charles Dickens", email: "charles@example.com" },
                { name: "Virginia Woolf", email: "virginia@example.com" },
            ],
            returning: ["id", "name"],
        });
        // [end: create-many]

        expect(authors).toHaveLength(3);
        expect(authors.map((a) => a.name)).toContain("Jane Austen");
    });

    // -------------------------------------------------------------------------
    // example: create-without-returning
    // -------------------------------------------------------------------------
    it("create without returning fields", async () => {
        // [start: create-without-returning]
        const count = await db.createOne("author", {
            values: {
                name: "Jane Austen",
                email: "jane@example.com",
            },
        });
        // count is the number of rows affected (1)
        // [end: create-without-returning]

        expect(count).toBe(1);
    });

    // -------------------------------------------------------------------------
    // example: update-one
    // -------------------------------------------------------------------------
    it("update a single record", async () => {
        // Setup
        const created = await db.createOne("author", {
            values: { name: "Jane Austen", email: "jane@example.com" },
            returning: ["id"],
        });

        // [start: update-one]
        const updated = await db.updateOne("author", {
            set: {
                bio: "English novelist known for romantic fiction",
            },
            where: { id: created.id },
            returning: ["id", "name", "bio"],
        });
        // [end: update-one]

        expect(updated.bio).toBe("English novelist known for romantic fiction");
    });

    // -------------------------------------------------------------------------
    // example: update-many
    // -------------------------------------------------------------------------
    it("update multiple records", async () => {
        // Setup
        const jane = await db.createOne("author", {
            values: { name: "Jane Austen", email: "jane@example.com" },
            returning: ["id"],
        });

        await db.createMany("book", {
            values: [
                {
                    title: "Pride and Prejudice",
                    authorId: jane.id,
                    published: false,
                },
                {
                    title: "Sense and Sensibility",
                    authorId: jane.id,
                    published: false,
                },
            ],
        });

        // [start: update-many]
        const count = await db.updateMany("book", {
            set: { published: true },
            where: { authorId: jane.id },
        });
        // count is the number of rows affected
        // [end: update-many]

        expect(count).toBe(2);

        // Verify
        const books = await db.findMany("book", {
            select: ["published"],
            where: { authorId: jane.id },
        });
        expect(books.every((b) => b.published)).toBe(true);
    });

    // -------------------------------------------------------------------------
    // example: delete-one
    // -------------------------------------------------------------------------
    it("delete a single record", async () => {
        // Setup
        const created = await db.createOne("author", {
            values: { name: "Jane Austen", email: "jane@example.com" },
            returning: ["id"],
        });

        // [start: delete-one]
        const deleted = await db.deleteOne("author", {
            where: { id: created.id },
            returning: ["id", "name"],
        });
        // [end: delete-one]

        expect(deleted.id).toBe(created.id);
        expect(deleted.name).toBe("Jane Austen");
    });

    // -------------------------------------------------------------------------
    // example: delete-many
    // -------------------------------------------------------------------------
    it("delete multiple records", async () => {
        // Setup
        await db.createMany("author", {
            values: [
                { name: "Author 1", email: "author1@example.com" },
                { name: "Author 2", email: "author2@example.com" },
                { name: "Author 3", email: "author3@example.com" },
            ],
        });

        // [start: delete-many]
        const count = await db.deleteMany("author", {
            where: {
                name: { [$in]: ["Author 1", "Author 2"] },
            },
        });
        // count is the number of rows deleted
        // [end: delete-many]

        expect(count).toBe(2);

        // Verify
        const remaining = await db.count("author", { where: {} });
        expect(remaining).toBe(1);
    });

    // -------------------------------------------------------------------------
    // example: on-conflict
    // -------------------------------------------------------------------------
    it("handle conflicts on insert", async () => {
        // Setup
        await db.createOne("author", {
            values: { name: "Jane Austen", email: "jane@example.com" },
        });

        // [start: on-conflict]
        // Insert or do nothing if email already exists
        const result = await db.createOne("author", {
            values: {
                name: "Jane Austen (duplicate)",
                email: "jane@example.com",
            },
            onConflict: { do: "nothing" },
        });
        // result is 0 because no row was inserted
        // [end: on-conflict]

        expect(result).toBe(0);

        // Verify original was not modified
        const author = await db.findOne("author", {
            select: ["name"],
            where: { email: "jane@example.com" },
        });
        expect(author.name).toBe("Jane Austen");
    });
});
