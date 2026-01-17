---
sidebar_position: 1
slug: /
---

# @casekit/orm

A type-safe, PostgreSQL-native ORM for TypeScript with deep relational querying, middleware support, and declarative schema definitions.

## Overview

@casekit/orm is a TypeScript ORM designed for PostgreSQL that prioritizes:

- **Full compile-time type safety** for queries and results
- **Deep relational queries** with 1:1, 1:N, N:1, and N:N relationships
- **Middleware system** for query interception (multi-tenancy, timestamps, etc.)
- **TypeScript model definitions** — no DSLs, just TypeScript
- **SQL for complex aggregations** — we don't try to do everything in the ORM, but instead give you tools to type your SQL queries easily

The ORM uses LATERAL JOINs for efficient multi-relation queries and validates all results with Zod schemas at runtime.

## Installation

```bash
npm add @casekit/orm @casekit/orm-cli @casekit/orm-migrate pg zod
```

## Quick Example

```typescript
import { orm, type Config, type ModelDefinition, $ilike } from "@casekit/orm";
import { sql } from "@casekit/sql";

// Define your models
const author = {
    fields: {
        id: { type: "serial", primaryKey: true },
        name: { type: "text" },
        email: { type: "text", unique: true },
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

const book = {
    fields: {
        id: { type: "serial", primaryKey: true },
        title: { type: "text" },
        authorId: {
            type: "integer",
            references: { model: "author", field: "id" },
        },
    },
    relations: {
        author: {
            type: "N:1",
            model: "author",
            fromField: "authorId",
            toField: "id",
        },
    },
} as const satisfies ModelDefinition;

// Create the ORM instance
const db = orm({
    models: { author, book },
    connection: { database: "myapp" },
});

await db.connect();

// Query with full type safety
const authorsWithBooks = await db.findMany("author", {
    select: ["id", "name"],
    include: {
        books: {
            select: ["id", "title"],
        },
    },
    where: {
        email: { [$ilike]: "%@example.com" },
    },
});
```

## Features

### Type-Safe Queries

Every query is fully typed based on your model definitions. The `select` clause determines which fields are returned, and the `include` clause adds related records.

### Relational Queries

Load related data efficiently with a single query using LATERAL JOINs:

```typescript
const author = await db.findOne("author", {
    select: ["id", "name"],
    include: {
        books: {
            select: ["id", "title"],
            where: { published: true },
            orderBy: [["title", "asc"]],
            limit: 10,
        },
    },
    where: { id: 1 },
});
```

### Middleware

Apply cross-cutting concerns like multi-tenancy or timestamps:

```typescript
const dbWithMiddleware = db.middleware([
    tenancy({ org: currentOrg }),
    userstamps({ user: currentUser }),
]);
```

### Raw SQL

For complex queries, use raw SQL with type safety:

```typescript
import { z } from "zod";
import { sql } from "@casekit/sql";

const results = await db.query(
    z.object({ total: z.number() }),
    sql`SELECT COUNT(*) as total FROM authors`
);
```

## Next Steps

- [Getting Started](./getting-started) — Set up your first project
- [Defining Models](./guide/defining-models) — Learn the model definition syntax
- [Querying](./guide/querying) — Master the query API
