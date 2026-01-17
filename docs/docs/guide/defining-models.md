---
sidebar_position: 1
---

# Defining Models

Models define the structure of your database tables. Each model specifies fields, constraints, and relationships.

## Basic Structure

A model is a TypeScript object that satisfies the `ModelDefinition` type:

```typescript
import type { ModelDefinition } from "@casekit/orm";

export const user = {
    fields: {
        id: { type: "serial", primaryKey: true },
        email: { type: "text", unique: true },
        name: { type: "text" },
    },
} as const satisfies ModelDefinition;
```

The `as const satisfies ModelDefinition` pattern ensures full type inference while validating the structure.

## Field Definitions

### Basic Fields

Every field requires a `type`:

```typescript
fields: {
    id: { type: "serial" },
    name: { type: "text" },
    age: { type: "integer" },
    balance: { type: "numeric" },
    active: { type: "boolean" },
    data: { type: "jsonb" },
    createdAt: { type: "timestamptz" },
}
```

### Supported Types

| Category | Types |
|----------|-------|
| **Integers** | `integer`, `bigint`, `smallint`, `serial`, `bigserial`, `smallserial` |
| **Decimals** | `numeric`, `decimal`, `real`, `double precision`, `money` |
| **Text** | `text`, `varchar`, `char` |
| **Boolean** | `boolean` |
| **Date/Time** | `date`, `time`, `timestamp`, `timestamptz`, `interval` |
| **JSON** | `json`, `jsonb` |
| **UUID** | `uuid` |
| **Binary** | `bytea` |
| **Arrays** | Any type with `[]` suffix, e.g., `text[]`, `integer[]` |

### Column Name Override

Map a field to a different column name:

```typescript
fields: {
    createdAt: {
        type: "timestamptz",
        column: "created_at",  // Column name in database
    },
}
```

### Nullable Fields

By default, fields are NOT NULL. Mark nullable fields explicitly:

```typescript
fields: {
    bio: {
        type: "text",
        nullable: true,
    },
}
```

### Default Values

Set default values using primitive types or SQL expressions:

```typescript
import { sql } from "@casekit/sql";

fields: {
    createdAt: {
        type: "timestamptz",
        default: sql`now()`,
    },
    status: {
        type: "text",
        default: "pending",
    },
    ordinal: {
        type: "integer",
        default: 0,
    },
    tags: {
        type: "text[]",
        default: sql`ARRAY[]::text[]`,
    },
}
```

### Primary Keys

Single-column primary keys:

```typescript
fields: {
    id: {
        type: "serial",
        primaryKey: true,
    },
}
```

Multi-column primary keys use the model-level `primaryKey` option:

```typescript
const bookTag = {
    fields: {
        bookId: { type: "integer" },
        tagId: { type: "integer" },
    },
    primaryKey: ["bookId", "tagId"],
} as const satisfies ModelDefinition;
```

### Unique Constraints

Simple unique constraint:

```typescript
fields: {
    email: {
        type: "text",
        unique: true,
    },
}
```

Partial unique constraint with WHERE clause:

```typescript
fields: {
    slug: {
        type: "text",
        unique: {
            where: sql`deleted_at IS NULL`,
        },
    },
}
```

Handle nulls in unique constraints:

```typescript
fields: {
    externalId: {
        type: "text",
        nullable: true,
        unique: {
            nullsNotDistinct: true,  // Only one NULL allowed
        },
    },
}
```

Multi-column unique constraints:

```typescript
const user = {
    fields: {
        orgId: { type: "integer" },
        email: { type: "text" },
    },
    uniqueConstraints: [
        {
            name: "unique_org_email",
            fields: ["orgId", "email"],
        },
    ],
} as const satisfies ModelDefinition;
```

### Foreign Keys

Single-column foreign keys:

```typescript
fields: {
    authorId: {
        type: "integer",
        references: {
            model: "author",
            field: "id",
        },
    },
}
```

With cascade options:

```typescript
fields: {
    authorId: {
        type: "integer",
        references: {
            model: "author",
            field: "id",
            onDelete: "CASCADE",
            onUpdate: "RESTRICT",
        },
    },
}
```

Multi-column foreign keys:

```typescript
const order = {
    fields: {
        countryCode: { type: "text" },
        regionCode: { type: "text" },
    },
    foreignKeys: [
        {
            name: "fk_region",
            fields: ["countryCode", "regionCode"],
            references: {
                model: "region",
                fields: ["countryCode", "code"],
            },
            onDelete: "SET NULL",
        },
    ],
} as const satisfies ModelDefinition;
```

### Custom Zod Schema

Override the default type inference with a custom Zod schema:

```typescript
import { z } from "zod";

fields: {
    settings: {
        type: "jsonb",
        zodSchema: z.object({
            theme: z.enum(["light", "dark"]),
            notifications: z.boolean(),
        }),
    },
}
```

### Provided Fields

Fields set by middleware (not required in inserts):

```typescript
fields: {
    createdBy: {
        type: "uuid",
        provided: true,  // Set by userstamps middleware
    },
}
```

## Relations

Relations define how models connect to each other.

### One-to-Many (1:N)

A parent model has many child records:

```typescript
const author = {
    fields: {
        id: { type: "serial", primaryKey: true },
    },
    relations: {
        books: {
            type: "1:N",
            model: "book",
            fromField: "id",      // author.id
            toField: "authorId",  // book.authorId
        },
    },
} as const satisfies ModelDefinition;
```

### Many-to-One (N:1)

A child model belongs to a parent:

```typescript
const book = {
    fields: {
        id: { type: "serial", primaryKey: true },
        authorId: { type: "integer" },
    },
    relations: {
        author: {
            type: "N:1",
            model: "author",
            fromField: "authorId",  // book.authorId
            toField: "id",          // author.id
        },
    },
} as const satisfies ModelDefinition;
```

Optional relations (LEFT JOIN instead of INNER JOIN):

```typescript
relations: {
    author: {
        type: "N:1",
        model: "author",
        fromField: "authorId",
        toField: "id",
        optional: true,  // NULL authorId allowed
    },
}
```

### Many-to-Many (N:N)

Through a junction table:

```typescript
const book = {
    fields: { /* ... */ },
    relations: {
        tags: {
            type: "N:N",
            model: "tag",
            through: {
                model: "bookTag",
                fromRelation: "book",  // bookTag.book relation
                toRelation: "tag",     // bookTag.tag relation
            },
        },
    },
} as const satisfies ModelDefinition;

const bookTag = {
    fields: {
        bookId: { type: "integer", references: { model: "book", field: "id" } },
        tagId: { type: "integer", references: { model: "tag", field: "id" } },
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
```

## Table and Schema Options

### Custom Table Name

```typescript
const userAccount = {
    table: "user_accounts",  // Override table name
    fields: { /* ... */ },
} as const satisfies ModelDefinition;
```

### Custom Schema

```typescript
const auditLog = {
    schema: "audit",  // PostgreSQL schema
    fields: { /* ... */ },
} as const satisfies ModelDefinition;
```

## Complete Example

```typescript
import type { ModelDefinition } from "@casekit/orm";
import { sql } from "@casekit/sql";
import { z } from "zod";

export const user = {
    table: "users",
    schema: "public",
    fields: {
        id: { type: "uuid", primaryKey: true, default: sql`gen_random_uuid()` },
        email: { type: "text", unique: true },
        name: { type: "text" },
        role: { type: "text", default: "'user'" },
        settings: {
            type: "jsonb",
            zodSchema: z.object({
                theme: z.enum(["light", "dark"]).default("light"),
            }),
            default: sql`'{}'::jsonb`,
        },
        orgId: {
            type: "uuid",
            references: { model: "organisation", field: "id" },
        },
        createdAt: { type: "timestamptz", default: sql`now()` },
        updatedAt: { type: "timestamptz", default: sql`now()` },
        deletedAt: { type: "timestamptz", nullable: true },
    },
    uniqueConstraints: [
        {
            name: "unique_org_email",
            fields: ["orgId", "email"],
            where: sql`deleted_at IS NULL`,
        },
    ],
    relations: {
        organisation: {
            type: "N:1",
            model: "organisation",
            fromField: "orgId",
            toField: "id",
        },
        posts: {
            type: "1:N",
            model: "post",
            fromField: "id",
            toField: "userId",
        },
    },
} as const satisfies ModelDefinition;
```
