---
sidebar_position: 2
---

# CLI Configuration

Configure the CLI using `orm.config.ts`.

## Basic Configuration

Create `orm.config.ts` in your project root:

```typescript
import { orm, type Config } from "@casekit/orm";
import type { OrmCLIConfig } from "@casekit/orm-cli";
import { snakeCase } from "es-toolkit";
import * as models from "./src/db/models";

const config = {
    models,
    naming: { column: snakeCase },
    connection: { database: "myapp" },
} as const satisfies Config;

export default {
    db: orm(config),
    directory: "./src/db",
} satisfies OrmCLIConfig;
```

## Configuration Options

### db (required)

The ORM instance:

```typescript
export default {
    db: orm(config),
    // ...
} satisfies OrmCLIConfig;
```

### directory (required)

Path to your database configuration directory:

```typescript
export default {
    db: orm(config),
    directory: "./src/db",
} satisfies OrmCLIConfig;
```

This directory will contain:
- `index.ts` — Database connection
- `models/` — Model definitions

### generate

Options for code generation:

```typescript
import { sql } from "@casekit/sql";

export default {
    db: orm(config),
    directory: "./src/db",
    generate: {
        templates: {
            default: {
                fields: {
                    id: { type: "serial", primaryKey: true },
                    createdAt: { type: "timestamptz", default: sql`now()` },
                    updatedAt: { type: "timestamptz", default: sql`now()` },
                },
            },
        },
    },
} satisfies OrmCLIConfig;
```

When you run `orm generate model user`, the template fields are included:

```typescript
export const user = {
    fields: {
        id: { type: "serial", primaryKey: true },
        createdAt: { type: "timestamptz", default: sql`now()` },
        updatedAt: { type: "timestamptz", default: sql`now()` },
    },
} as const satisfies ModelDefinition;
```

### migrate

Migration-specific options:

```typescript
export default {
    db: orm(config),
    directory: "./src/db",
    migrate: {
        connection: {
            // Override connection for migrations
            host: "localhost",
            port: 5432,
            database: "myapp_migrations",
            user: "migration_user",
            password: "migration_password",
        },
    },
} satisfies OrmCLIConfig;
```

## Environment Variables

The CLI loads `.env` automatically. Use environment variables for sensitive configuration:

```typescript
// orm.config.ts
export default {
    db: orm({
        models,
        connection: {
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || "5432"),
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
        },
    }),
    directory: "./src/db",
} satisfies OrmCLIConfig;
```

```bash
# .env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myapp
DB_USER=postgres
DB_PASSWORD=secret
```

## Custom Config Path

Specify a different config file:

```bash
pnpm orm db push --config ./config/orm.config.ts
```

## Complete Example

```typescript
// orm.config.ts
import { orm, type Config } from "@casekit/orm";
import type { OrmCLIConfig } from "@casekit/orm-cli";
import { sql } from "@casekit/sql";
import { snakeCase } from "es-toolkit";
import * as models from "./src/db/models";

const config = {
    schema: "public",
    models,
    naming: {
        column: snakeCase,
        table: snakeCase,
    },
    connection: {
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "5432"),
        database: process.env.DB_NAME || "myapp",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD,
    },
    extensions: ["uuid-ossp"],
} as const satisfies Config;

export default {
    db: orm(config),
    directory: "./src/db",
    generate: {
        templates: {
            default: {
                fields: {
                    id: { type: "uuid", primaryKey: true, default: sql`gen_random_uuid()` },
                    createdAt: { type: "timestamptz", default: sql`now()` },
                    updatedAt: { type: "timestamptz", default: sql`now()` },
                },
            },
            audit: {
                fields: {
                    id: { type: "serial", primaryKey: true },
                    action: { type: "text" },
                    payload: { type: "jsonb" },
                    createdAt: { type: "timestamptz", default: sql`now()` },
                },
            },
        },
    },
} satisfies OrmCLIConfig;
```

## Type Reference

```typescript
interface OrmCLIConfig {
    db: Orm;                           // ORM instance
    directory: string;                 // Models directory path
    generate?: {
        templates?: Record<string, ModelDefinition>;
        defaultSchemas?: Record<string, ZodType>;
    };
    migrate?: {
        connection?: ConnectionConfig;
    };
}
```
