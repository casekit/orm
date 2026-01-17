/**
 * @fileoverview Examples from the Transactions guide.
 * These examples are tested to ensure they work correctly.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { getDb, cleanupDb, resetDb, type DB } from "./setup.js";

describe("Transactions Examples", () => {
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
    // example: basic-transaction
    // -------------------------------------------------------------------------
    it("basic transaction", async () => {
        // [start: basic-transaction]
        await db.transact(async (tx) => {
            const author = await tx.createOne("author", {
                values: {
                    name: "Jane Austen",
                    email: "jane@example.com",
                },
                returning: ["id"],
            });

            await tx.createOne("book", {
                values: {
                    title: "Pride and Prejudice",
                    authorId: author.id,
                },
            });
        });
        // Both author and book are committed together
        // [end: basic-transaction]

        // Verify
        const authors = await db.count("author", { where: {} });
        const books = await db.count("book", { where: {} });
        expect(authors).toBe(1);
        expect(books).toBe(1);
    });

    // -------------------------------------------------------------------------
    // example: transaction-rollback
    // -------------------------------------------------------------------------
    it("transaction rollback on error", async () => {
        // [start: transaction-rollback]
        try {
            await db.transact(async (tx) => {
                await tx.createOne("author", {
                    values: {
                        name: "Jane Austen",
                        email: "jane@example.com",
                    },
                });

                // This will cause the entire transaction to roll back
                throw new Error("Something went wrong");
            });
        } catch (error) {
            // Transaction was rolled back, author was not created
        }
        // [end: transaction-rollback]

        // Verify rollback
        const authors = await db.count("author", { where: {} });
        expect(authors).toBe(0);
    });

    // -------------------------------------------------------------------------
    // example: transaction-return
    // -------------------------------------------------------------------------
    it("return values from transaction", async () => {
        // [start: transaction-return]
        const result = await db.transact(async (tx) => {
            const author = await tx.createOne("author", {
                values: {
                    name: "Jane Austen",
                    email: "jane@example.com",
                },
                returning: ["id", "name"],
            });

            const book = await tx.createOne("book", {
                values: {
                    title: "Pride and Prejudice",
                    authorId: author.id,
                },
                returning: ["id", "title"],
            });

            return { author, book };
        });

        // result.author and result.book are available here
        // [end: transaction-return]

        expect(result.author.name).toBe("Jane Austen");
        expect(result.book.title).toBe("Pride and Prejudice");
    });

    // -------------------------------------------------------------------------
    // example: transaction-rollback-option
    // -------------------------------------------------------------------------
    it("force rollback for testing", async () => {
        // [start: transaction-rollback-option]
        // Useful for testing - run operations but roll back at the end
        await db.transact(
            async (tx) => {
                await tx.createOne("author", {
                    values: {
                        name: "Test Author",
                        email: "test@example.com",
                    },
                });

                // Verify within transaction
                const count = await tx.count("author", { where: {} });
                // count is 1 inside the transaction
            },
            { rollback: true }
        );
        // [end: transaction-rollback-option]

        // Verify rollback - nothing was persisted
        const authors = await db.count("author", { where: {} });
        expect(authors).toBe(0);
    });

    // -------------------------------------------------------------------------
    // example: nested-transactions
    // -------------------------------------------------------------------------
    it("nested transactions with savepoints", async () => {
        // [start: nested-transactions]
        await db.transact(async (tx) => {
            const author = await tx.createOne("author", {
                values: {
                    name: "Jane Austen",
                    email: "jane@example.com",
                },
                returning: ["id"],
            });

            // Nested transaction creates a savepoint
            try {
                await tx.transact(async (inner) => {
                    await inner.createOne("book", {
                        values: {
                            title: "Failed Book",
                            authorId: author.id,
                        },
                    });

                    throw new Error("Roll back only the book");
                });
            } catch {
                // Inner transaction rolled back to savepoint
                // Author is still created
            }

            // Create a successful book
            await tx.createOne("book", {
                values: {
                    title: "Pride and Prejudice",
                    authorId: author.id,
                },
            });
        });
        // [end: nested-transactions]

        // Verify: author and one book should exist
        const authors = await db.count("author", { where: {} });
        const books = await db.count("book", { where: {} });
        expect(authors).toBe(1);
        expect(books).toBe(1);
    });
});
