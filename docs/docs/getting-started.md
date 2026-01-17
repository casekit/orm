---
sidebar_position: 2
---

# Getting Started

This guide walks you through setting up @casekit/orm in a new project.

## Prerequisites

- Node.js 20+
- PostgreSQL database
- npm, yarn, or pnpm

## Installation

```bash
npm add @casekit/orm @casekit/orm-cli @casekit/orm-migrate pg zod
```

## Initialize Your Project

The CLI can scaffold your project structure:

```bash
npx orm init --directory ./src/db
```

This creates:
- `src/db/index.ts` — Database connection
- `src/db/models/index.ts` — Model exports
- `orm.config.ts` — CLI configuration

## Define Your Models

Create a model file for each table. Here's an example author model:

```typescript
// src/db/models/author.ts
import type { ModelDefinition } from "@casekit/orm";
import { sql } from "@casekit/sql";

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
```

And a related book model:

```typescript
// src/db/models/book.ts
import type { ModelDefinition } from "@casekit/orm";
import { sql } from "@casekit/sql";

export const book = {
    fields: {
        id: { type: "serial", primaryKey: true },
        title: { type: "text" },
        authorId: {
            type: "integer",
            references: { model: "author", field: "id" },
        },
        published: { type: "boolean", default: false },
        createdAt: { type: "timestamptz", default: sql`now()` },
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
```

Export your models from the index:

```typescript
// src/db/models/index.ts
export { author } from "./author.js";
export { book } from "./book.js";
```

## Configure the Database

Set up your database connection:

```typescript
// src/db/index.ts
import { orm, type Config, type ModelType, type Orm } from "@casekit/orm";
import { snakeCase } from "es-toolkit";
import * as models from "./models/index.js";

const config = {
    models,
    naming: { column: snakeCase },
    connection: {
        host: "localhost",
        port: 5432,
        database: "myapp",
        user: "postgres",
        password: "password",
    },
} as const satisfies Config;

export const db = orm(config);

// Type exports for use elsewhere
export type DB = Orm<typeof config>;
export type Models = typeof models;
export type Model<M extends keyof Models> = ModelType<Models[M]>;
```

## Push Schema to Database

Create the tables in your database:

```bash
createdb myapp
npx orm db push
```

## Basic Operations

### Create a Record

```typescript
const author = await db.createOne("author", {
    values: {
        name: "Jane Austen",
        email: "jane@example.com",
    },
    returning: ["id", "name", "createdAt"],
});
```

### Find a Record

```typescript
const author = await db.findOne("author", {
    select: ["id", "name", "email"],
    where: { id: 1 },
});
```

### Find Many Records

```typescript
const authors = await db.findMany("author", {
    select: ["id", "name"],
    orderBy: [["name", "asc"]],
});
```

### Update a Record

```typescript
const updated = await db.updateOne("author", {
    set: { bio: "English novelist known for romantic fiction" },
    where: { id: 1 },
    returning: ["id", "name", "bio"],
});
```

### Delete a Record

```typescript
const deleted = await db.deleteOne("author", {
    where: { id: 1 },
    returning: ["id"],
});
```

## Development Setup

For development, you'll want to reuse the database connection across hot reloads:

```typescript
// src/db/index.ts
import { orm, type Config, type Orm } from "@casekit/orm";

const config = { /* ... */ } as const satisfies Config;

let db: Orm<typeof config>;

declare global {
    var __db: Orm<typeof config>;
}

if (process.env.NODE_ENV === "production") {
    db = orm(config);
    await db.connect();
} else {
    if (!global.__db) {
        global.__db = orm(config);
        await global.__db.connect();
    }
    db = global.__db;
}

export { db };
```

## Next Steps

- [Defining Models](./guide/defining-models) — Complete model definition reference
- [Querying](./guide/querying) — Learn the full query API
- [Relations](./guide/relations) — Work with related data
