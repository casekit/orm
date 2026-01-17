---
sidebar_position: 2
---

# Configuration

Complete reference for ORM configuration options.

## Config Interface

```typescript
import type { Config } from "@casekit/orm";

const config = {
    models: { /* ... */ },
    // ... other options
} satisfies Config;
```

## Options

### models (required)

Object containing all model definitions:

```typescript
import { author, book, tag } from "./models";

const config = {
    models: { author, book, tag },
} satisfies Config;
```

### schema

Default PostgreSQL schema for all models:

```typescript
const config = {
    models,
    schema: "public",  // Default: undefined (uses PostgreSQL default)
} satisfies Config;
```

Individual models can override this with their own `schema` property.

### connection

PostgreSQL connection configuration:

```typescript
const config = {
    models,
    connection: {
        host: "localhost",
        port: 5432,
        database: "myapp",
        user: "postgres",
        password: "password",
        ssl: true,  // or { rejectUnauthorized: false }
    },
} satisfies Config;
```

Or use a connection string:

```typescript
const config = {
    models,
    connection: {
        connectionString: "postgresql://user:pass@host:5432/db",
    },
} satisfies Config;
```

### pool

Enable connection pooling:

```typescript
const config = {
    models,
    pool: true,  // Default: true
} satisfies Config;
```

With pool options:

```typescript
const config = {
    models,
    connection: {
        database: "myapp",
        max: 20,                    // Max connections
        idleTimeoutMillis: 30000,   // Close idle connections after 30s
        connectionTimeoutMillis: 2000, // Connection timeout
    },
    pool: true,
} satisfies Config;
```

### naming

Transform field and model names for database columns/tables:

```typescript
import { snakeCase } from "es-toolkit";

const config = {
    models,
    naming: {
        column: snakeCase,  // authorId → author_id
        table: snakeCase,   // userProfile → user_profile
    },
} satisfies Config;
```

### extensions

PostgreSQL extensions to create:

```typescript
const config = {
    models,
    extensions: ["uuid-ossp", "pg_trgm"],
} satisfies Config;
```

Extensions are created in each schema when running `db push`.

### operators

Custom WHERE operators:

```typescript
import { sql } from "@casekit/sql";

const $contains = Symbol("contains");

const config = {
    models,
    operators: {
        where: {
            [$contains]: (meta, value) =>
                sql`${meta.column} @> ${value}`,
        },
    },
} satisfies Config;

// Usage
const posts = await db.findMany("post", {
    select: ["id", "title"],
    where: {
        tags: { [$contains]: ["typescript", "orm"] },
    },
});
```

### logger

Custom logger for query debugging:

```typescript
const config = {
    models,
    logger: {
        debug: (...args) => console.debug(...args),
        info: (...args) => console.info(...args),
        warn: (...args) => console.warn(...args),
        error: (...args) => console.error(...args),
    },
} satisfies Config;
```

Or use pino:

```typescript
import pino from "pino";

const config = {
    models,
    logger: pino({ level: "debug" }),
} satisfies Config;
```

## Environment-Based Configuration

```typescript
const config = {
    models,
    connection: {
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "5432"),
        database: process.env.DB_NAME || "myapp",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "password",
    },
    pool: process.env.NODE_ENV === "production",
} satisfies Config;
```

## Complete Example

```typescript
import { orm, type Config } from "@casekit/orm";
import { sql } from "@casekit/sql";
import { snakeCase } from "es-toolkit";
import pino from "pino";
import * as models from "./models";

const $arrayContains = Symbol("arrayContains");

const config = {
    schema: "app",
    models,
    connection: {
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "5432"),
        database: process.env.DB_NAME || "myapp",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD,
        ssl: process.env.NODE_ENV === "production",
        max: 20,
    },
    pool: true,
    naming: {
        column: snakeCase,
        table: snakeCase,
    },
    extensions: ["uuid-ossp"],
    operators: {
        where: {
            [$arrayContains]: (meta, value) =>
                sql`${meta.column} @> ${value}`,
        },
    },
    logger: pino({
        level: process.env.LOG_LEVEL || "info"
    }),
} as const satisfies Config;

export const db = orm(config);
```
