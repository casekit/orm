# @casekit/orm

A type-safe, PostgreSQL-native ORM for TypeScript with deep relational querying, middleware support, and declarative schema definitions.

## Why @casekit/orm?

- **Full compile-time type safety** — Queries and results are fully typed based on your model definitions
- **Deep relational queries** — Load related data with 1:1, 1:N, N:1, and N:N relationships using efficient LATERAL JOINs
- **Middleware system** — Intercept queries for multi-tenancy, timestamps, audit logs, and more
- **TypeScript-native** — Define models in plain TypeScript, no DSLs or code generation required
- **SQL when you need it** — Escape hatch to raw SQL with Zod schema validation for complex aggregations

## Installation

```bash
npm add @casekit/orm @casekit/orm-cli @casekit/orm-migrate pg zod
```

## Quick Start

### 1. Initialize your project

```bash
pnpm orm init --directory ./src/db
```

### 2. Define your models

```typescript
// src/db/models/author.ts
import type { ModelDefinition } from "@casekit/orm";
import { sql } from "@casekit/sql";

export const author = {
    fields: {
        id: { type: "serial", primaryKey: true },
        name: { type: "text" },
        email: { type: "text", unique: true },
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
```

### 3. Create the ORM instance

```typescript
// src/db/index.ts
import { orm, type Config } from "@casekit/orm";
import { snakeCase } from "es-toolkit";
import * as models from "./models/index.js";

const config = {
    models,
    naming: { column: snakeCase },
    connection: { database: "myapp" },
} as const satisfies Config;

export const db = orm(config);
```

### 4. Push schema to database

```bash
pnpm orm db push
```

### 5. Query with full type safety

```typescript
import { $ilike } from "@casekit/orm";

const authorsWithBooks = await db.findMany("author", {
    select: ["id", "name"],
    include: {
        books: {
            select: ["id", "title"],
            where: { published: true },
            orderBy: [["title", "asc"]],
            limit: 5,
        },
    },
    where: {
        email: { [$ilike]: "%@example.com" },
    },
});
```

## Features

### CRUD Operations

```typescript
// Create
const author = await db.createOne("author", {
    values: { name: "Jane", email: "jane@example.com" },
    returning: ["id", "createdAt"],
});

// Read
const authors = await db.findMany("author", {
    select: ["id", "name"],
    where: { name: { [$ilike]: "%john%" } },
    orderBy: [["name", "asc"]],
    limit: 10,
});

// Update
await db.updateOne("author", {
    set: { name: "Jane Doe" },
    where: { id: 1 },
});

// Delete
await db.deleteOne("author", {
    where: { id: 1 },
});
```

### Transactions

```typescript
await db.transact(async (tx) => {
    const author = await tx.createOne("author", {
        values: { name: "New Author", email: "new@example.com" },
        returning: ["id"],
    });

    await tx.createOne("book", {
        values: { title: "New Book", authorId: author.id },
    });
});
```

### Middleware

Apply cross-cutting concerns like multi-tenancy or automatic timestamps:

```typescript
const dbWithMiddleware = db.middleware([
    tenancy({ org: currentOrg }),
    userstamps({ user: currentUser }),
]);

// All queries automatically filtered by org and stamped with user
```

### Raw SQL

For complex queries, use raw SQL with type safety via Zod:

```typescript
import { z } from "zod";
import { sql } from "@casekit/sql";

const results = await db.query(
    z.object({ total: z.number() }),
    sql`SELECT COUNT(*) as total FROM authors WHERE active = true`
);
```

## Packages

| Package | Description |
|---------|-------------|
| `@casekit/orm` | Core ORM library |
| `@casekit/orm-cli` | CLI for init, push, pull, generate |
| `@casekit/orm-migrate` | Schema migration engine |
| `@casekit/orm-schema` | Type definitions |
| `@casekit/orm-config` | Configuration normalization |
| `@casekit/sql` | SQL template literal builder |

## Documentation

Full documentation available at the [docs site](./docs).

- [Getting Started](./docs/docs/getting-started.md)
- [Defining Models](./docs/docs/guide/defining-models.md)
- [Querying](./docs/docs/guide/querying.md)
- [Relations](./docs/docs/guide/relations.md)
- [Middleware](./docs/docs/guide/middleware.md)
- [Transactions](./docs/docs/guide/transactions.md)
- [Raw SQL](./docs/docs/guide/raw-sql.md)
- [CLI Commands](./docs/docs/cli/commands.md)
- [API Reference](./docs/docs/api/overview.md)

## Requirements

- Node.js 20+
- PostgreSQL

## License

MIT
