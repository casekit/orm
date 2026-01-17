/**
 * @fileoverview Examples from the Relations guide.
 * These examples are tested to ensure they work correctly.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { getDb, cleanupDb, resetDb, type DB } from "./setup.js";

describe("Relations Examples", () => {
    let db: DB;

    beforeAll(async () => {
        db = await getDb();
    });

    afterAll(async () => {
        await cleanupDb();
    });

    beforeEach(async () => {
        await resetDb();
        // Seed data for relation examples
        const jane = await db.createOne("author", {
            values: { name: "Jane Austen", email: "jane@example.com" },
            returning: ["id"],
        });

        await db.createMany("book", {
            values: [
                { title: "Pride and Prejudice", authorId: jane.id },
                { title: "Sense and Sensibility", authorId: jane.id },
            ],
        });

        // Add tags
        const fiction = await db.createOne("tag", {
            values: { name: "Fiction" },
            returning: ["id"],
        });
        const romance = await db.createOne("tag", {
            values: { name: "Romance" },
            returning: ["id"],
        });

        const books = await db.findMany("book", {
            select: ["id"],
        });

        // Tag the books
        await db.createMany("bookTag", {
            values: [
                { bookId: books[0].id, tagId: fiction.id },
                { bookId: books[0].id, tagId: romance.id },
                { bookId: books[1].id, tagId: fiction.id },
            ],
        });
    });

    // -------------------------------------------------------------------------
    // example: include-one-to-many
    // -------------------------------------------------------------------------
    it("include one-to-many relation", async () => {
        // [start: include-one-to-many]
        const author = await db.findOne("author", {
            select: ["id", "name"],
            include: {
                books: {
                    select: ["id", "title"],
                },
            },
            where: { name: "Jane Austen" },
        });
        // [end: include-one-to-many]

        expect(author.name).toBe("Jane Austen");
        expect(author.books).toHaveLength(2);
        expect(author.books[0]).toHaveProperty("title");
    });

    // -------------------------------------------------------------------------
    // example: include-many-to-one
    // -------------------------------------------------------------------------
    it("include many-to-one relation", async () => {
        // [start: include-many-to-one]
        const books = await db.findMany("book", {
            select: ["id", "title"],
            include: {
                author: {
                    select: ["id", "name"],
                },
            },
        });
        // [end: include-many-to-one]

        expect(books).toHaveLength(2);
        expect(books[0].author.name).toBe("Jane Austen");
    });

    // -------------------------------------------------------------------------
    // example: include-many-to-many
    // -------------------------------------------------------------------------
    it("include many-to-many relation", async () => {
        // [start: include-many-to-many]
        const books = await db.findMany("book", {
            select: ["id", "title"],
            include: {
                tags: {
                    select: ["id", "name"],
                },
            },
        });
        // [end: include-many-to-many]

        expect(books).toHaveLength(2);
        // Pride and Prejudice has 2 tags
        const prideAndPrejudice = books.find(
            (b) => b.title === "Pride and Prejudice"
        );
        expect(prideAndPrejudice?.tags).toHaveLength(2);
    });

    // -------------------------------------------------------------------------
    // example: nested-include
    // -------------------------------------------------------------------------
    it("nested includes", async () => {
        // [start: nested-include]
        const author = await db.findOne("author", {
            select: ["id", "name"],
            include: {
                books: {
                    select: ["id", "title"],
                    include: {
                        tags: {
                            select: ["id", "name"],
                        },
                    },
                },
            },
            where: { name: "Jane Austen" },
        });
        // [end: nested-include]

        expect(author.books[0].tags).toBeDefined();
        expect(Array.isArray(author.books[0].tags)).toBe(true);
    });

    // -------------------------------------------------------------------------
    // example: include-with-filter
    // -------------------------------------------------------------------------
    it("filter included relations", async () => {
        // Setup: publish one book
        const books = await db.findMany("book", { select: ["id", "title"] });
        await db.updateOne("book", {
            set: { published: true },
            where: { title: "Pride and Prejudice" },
        });

        // [start: include-with-filter]
        const author = await db.findOne("author", {
            select: ["id", "name"],
            include: {
                books: {
                    select: ["id", "title", "published"],
                    where: { published: true },
                },
            },
            where: { name: "Jane Austen" },
        });
        // [end: include-with-filter]

        expect(author.books).toHaveLength(1);
        expect(author.books[0].title).toBe("Pride and Prejudice");
    });

    // -------------------------------------------------------------------------
    // example: include-with-order
    // -------------------------------------------------------------------------
    it("order included relations", async () => {
        // [start: include-with-order]
        const author = await db.findOne("author", {
            select: ["id", "name"],
            include: {
                books: {
                    select: ["id", "title"],
                    orderBy: [["title", "asc"]],
                },
            },
            where: { name: "Jane Austen" },
        });
        // [end: include-with-order]

        expect(author.books[0].title).toBe("Pride and Prejudice");
        expect(author.books[1].title).toBe("Sense and Sensibility");
    });

    // -------------------------------------------------------------------------
    // example: include-with-limit
    // -------------------------------------------------------------------------
    it("limit included relations", async () => {
        // [start: include-with-limit]
        const author = await db.findOne("author", {
            select: ["id", "name"],
            include: {
                books: {
                    select: ["id", "title"],
                    limit: 1,
                },
            },
            where: { name: "Jane Austen" },
        });
        // [end: include-with-limit]

        expect(author.books).toHaveLength(1);
    });
});
