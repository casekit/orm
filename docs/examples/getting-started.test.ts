/**
 * @fileoverview Examples from the Getting Started guide.
 * These examples are tested to ensure they work correctly.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { getDb, cleanupDb, resetDb, type DB } from "./setup.js";

describe("Getting Started Examples", () => {
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
    // example: create-author
    // -------------------------------------------------------------------------
    it("create an author", async () => {
        // [start: create-author]
        const author = await db.createOne("author", {
            values: {
                name: "Jane Austen",
                email: "jane@example.com",
            },
            returning: ["id", "name", "createdAt"],
        });
        // [end: create-author]

        expect(author).toMatchObject({
            name: "Jane Austen",
        });
        expect(author.id).toBeTypeOf("number");
        expect(author.createdAt).toBeInstanceOf(Date);
    });

    // -------------------------------------------------------------------------
    // example: find-author
    // -------------------------------------------------------------------------
    it("find an author", async () => {
        // Setup
        const created = await db.createOne("author", {
            values: { name: "Jane Austen", email: "jane@example.com" },
            returning: ["id"],
        });

        // [start: find-author]
        const author = await db.findOne("author", {
            select: ["id", "name", "email"],
            where: { id: created.id },
        });
        // [end: find-author]

        expect(author).toMatchObject({
            id: created.id,
            name: "Jane Austen",
            email: "jane@example.com",
        });
    });

    // -------------------------------------------------------------------------
    // example: find-many-authors
    // -------------------------------------------------------------------------
    it("find many authors", async () => {
        // Setup
        await db.createMany("author", {
            values: [
                { name: "Jane Austen", email: "jane@example.com" },
                { name: "Charles Dickens", email: "charles@example.com" },
                { name: "Virginia Woolf", email: "virginia@example.com" },
            ],
        });

        // [start: find-many-authors]
        const authors = await db.findMany("author", {
            select: ["id", "name"],
            orderBy: [["name", "asc"]],
        });
        // [end: find-many-authors]

        expect(authors).toHaveLength(3);
        expect(authors[0].name).toBe("Charles Dickens");
        expect(authors[1].name).toBe("Jane Austen");
        expect(authors[2].name).toBe("Virginia Woolf");
    });

    // -------------------------------------------------------------------------
    // example: update-author
    // -------------------------------------------------------------------------
    it("update an author", async () => {
        // Setup
        const created = await db.createOne("author", {
            values: { name: "Jane Austen", email: "jane@example.com" },
            returning: ["id"],
        });

        // [start: update-author]
        const updated = await db.updateOne("author", {
            set: { bio: "English novelist known for her social commentary" },
            where: { id: created.id },
            returning: ["id", "name", "bio"],
        });
        // [end: update-author]

        expect(updated.bio).toBe(
            "English novelist known for her social commentary"
        );
    });

    // -------------------------------------------------------------------------
    // example: delete-author
    // -------------------------------------------------------------------------
    it("delete an author", async () => {
        // Setup
        const created = await db.createOne("author", {
            values: { name: "Jane Austen", email: "jane@example.com" },
            returning: ["id"],
        });

        // [start: delete-author]
        const deleted = await db.deleteOne("author", {
            where: { id: created.id },
            returning: ["id"],
        });
        // [end: delete-author]

        expect(deleted.id).toBe(created.id);

        // Verify deletion
        const count = await db.count("author", { where: {} });
        expect(count).toBe(0);
    });
});
