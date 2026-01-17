/**
 * Shared setup for documentation examples.
 * These models and database setup are used throughout the documentation.
 */

import type { ModelDefinition } from "@casekit/orm";
import { $gte, orm, type Config, type ModelType, type Orm } from "@casekit/orm";
import { migrate } from "@casekit/orm-migrate";
import { sql } from "@casekit/sql";
import { snakeCase } from "es-toolkit";

// -----------------------------------------------------------------------------
// Model Definitions
// -----------------------------------------------------------------------------

export const author = {
    fields: {
        id: { type: "serial", primaryKey: true },
        name: { type: "text" },
        email: { type: "text", unique: true },
        bio: { type: "text", nullable: true },
        createdAt: { type: "timestamptz", default: sql`now()` },
    },
    relations: {
        books: {
            type: "1:N",
            model: "book",
            fromField: "id",
            toField: "authorId",
        },
    },
} as const satisfies ModelDefinition;

export const book = {
    fields: {
        id: { type: "serial", primaryKey: true },
        title: { type: "text" },
        authorId: {
            type: "integer",
            references: { model: "author", field: "id" },
        },
        published: { type: "boolean", default: false },
        publishedAt: { type: "timestamptz", nullable: true },
        createdAt: { type: "timestamptz", default: sql`now()` },
    },
    relations: {
        author: {
            type: "N:1",
            model: "author",
            fromField: "authorId",
            toField: "id",
        },
        tags: {
            type: "N:N",
            model: "tag",
            through: {
                model: "bookTag",
                fromRelation: "book",
                toRelation: "tag",
            },
        },
    },
} as const satisfies ModelDefinition;

export const tag = {
    fields: {
        id: { type: "serial", primaryKey: true },
        name: { type: "text", unique: true },
    },
    relations: {
        books: {
            type: "N:N",
            model: "book",
            through: {
                model: "bookTag",
                fromRelation: "tag",
                toRelation: "book",
            },
        },
    },
} as const satisfies ModelDefinition;

export const bookTag = {
    fields: {
        bookId: {
            type: "integer",
            references: { model: "book", field: "id", onDelete: "CASCADE" },
        },
        tagId: {
            type: "integer",
            references: { model: "tag", field: "id", onDelete: "CASCADE" },
        },
    },
    primaryKey: ["bookId", "tagId"],
    relations: {
        book: {
            type: "N:1",
            model: "book",
            fromField: "bookId",
            toField: "id",
        },
        tag: {
            type: "N:1",
            model: "tag",
            fromField: "tagId",
            toField: "id",
        },
    },
} as const satisfies ModelDefinition;

export const models = { author, book, tag, bookTag };

// -----------------------------------------------------------------------------
// Database Configuration
// -----------------------------------------------------------------------------

export const config = {
    schema: "docs",
    models,
    naming: {
        table: snakeCase,
        column: snakeCase,
    },
    connection: {
        host: "127.0.0.1",
        port: 54321,
        user: "orm",
        password: "password",
        database: "orm",
    },
    pool: true,
} satisfies Config;

export type Models = typeof models;
export type DB = Orm<typeof config>;
export type Model<M extends keyof Models> = ModelType<Models[M]>;

// -----------------------------------------------------------------------------
// Test Helpers
// -----------------------------------------------------------------------------

let db: DB | null = null;

export async function getDb(): Promise<DB> {
    if (db) return db;

    db = orm(config);
    await db.connect();
    await migrate.push(db);

    return db;
}

export async function cleanupDb(): Promise<void> {
    if (db) {
        await migrate.drop(db);
        await db.close();
        db = null;
    }
}

export async function resetDb(): Promise<void> {
    const database = await getDb();
    // Delete all data in reverse order of dependencies
    // Use a WHERE clause that matches all records
    await database.deleteMany("bookTag", { where: { bookId: { [$gte]: 0 } } });
    await database.deleteMany("book", { where: { id: { [$gte]: 0 } } });
    await database.deleteMany("tag", { where: { id: { [$gte]: 0 } } });
    await database.deleteMany("author", { where: { id: { [$gte]: 0 } } });
}
