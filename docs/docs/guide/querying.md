---
sidebar_position: 2
---

# Querying

The ORM provides type-safe methods for querying data.

## Finding Records

### findOne

Retrieve a single record. Throws if no record matches.

```typescript
const author = await db.findOne("author", {
    select: ["id", "name", "email"],
    where: { id: 1 },
});
```

### findMany

Retrieve multiple records:

```typescript
const authors = await db.findMany("author", {
    select: ["id", "name"],
    orderBy: [["name", "asc"]],
});
```

### count

Count matching records:

```typescript
const totalAuthors = await db.count("author", {
    where: {},
});

const activeAuthors = await db.count("author", {
    where: { active: true },
});
```

## Select Clause

The `select` clause is required and determines which fields are returned:

```typescript
const authors = await db.findMany("author", {
    select: ["id", "name"],  // Only these fields returned
});

// authors[0] is typed as { id: number; name: string }
```

## Where Clause

Filter records using the `where` clause.

### Equality

Simple equality uses direct values:

```typescript
const author = await db.findOne("author", {
    select: ["id", "name", "email"],
    where: { name: "Jane Austen" },
});
```

### Comparison Operators

Import operators for advanced filtering:

```typescript
import { $gt, $gte, $lt, $lte, $ne } from "@casekit/orm";

const recentBooks = await db.findMany("book", {
    select: ["id", "title"],
    where: {
        publishedAt: { [$gte]: new Date("2024-01-01") },
    },
});
```

| Operator | Description |
|----------|-------------|
| `$eq` | Equal (default for plain values) |
| `$ne` | Not equal |
| `$gt` | Greater than |
| `$gte` | Greater than or equal |
| `$lt` | Less than |
| `$lte` | Less than or equal |

### IN Operator

Match against multiple values:

```typescript
import { $in } from "@casekit/orm";

const authors = await db.findMany("author", {
    select: ["id", "name"],
    where: {
        name: { [$in]: ["Jane Austen", "Virginia Woolf"] },
    },
});
```

### Pattern Matching

Use LIKE and ILIKE for pattern matching:

```typescript
import { $like, $ilike } from "@casekit/orm";

const authors = await db.findMany("author", {
    select: ["id", "name"],
    where: {
        email: { [$ilike]: "%@example.com" },  // Case-insensitive
    },
});

const books = await db.findMany("book", {
    select: ["id", "title"],
    where: {
        title: { [$like]: "The %" },  // Case-sensitive
    },
});
```

### NULL Checks

Use `$is` for NULL/boolean checks:

```typescript
import { $is } from "@casekit/orm";

// Find records where bio is NULL
const authorsWithoutBio = await db.findMany("author", {
    select: ["id", "name"],
    where: {
        bio: { [$is]: null },
    },
});

// Find records where active is TRUE
const activeAuthors = await db.findMany("author", {
    select: ["id", "name"],
    where: {
        active: { [$is]: true },
    },
});
```

### Logical Operators

Combine conditions with AND and OR:

```typescript
import { $and, $or } from "@casekit/orm";

// OR logic
const authors = await db.findMany("author", {
    select: ["id", "name"],
    where: {
        [$or]: [
            { name: "Jane Austen" },
            { name: "Virginia Woolf" },
        ],
    },
});

// AND logic
const verifiedActiveAuthors = await db.findMany("author", {
    select: ["id", "name"],
    where: {
        [$and]: [
            { active: true },
            { verified: true },
        ],
    },
});

// Combined
const filteredAuthors = await db.findMany("author", {
    select: ["id", "name"],
    where: {
        [$or]: [
            { role: "admin" },
            {
                [$and]: [
                    { status: "active" },
                    { verified: true },
                ],
            },
        ],
    },
});
```

## Ordering

Sort results with `orderBy`:

```typescript
const authors = await db.findMany("author", {
    select: ["id", "name", "createdAt"],
    orderBy: [
        ["name", "asc"],      // Primary sort
        ["createdAt", "desc"], // Secondary sort
    ],
});
```

## Pagination

Use `limit` and `offset` for pagination:

```typescript
// Page 1
const page1 = await db.findMany("author", {
    select: ["id", "name"],
    orderBy: [["name", "asc"]],
    limit: 10,
    offset: 0,
});

// Page 2
const page2 = await db.findMany("author", {
    select: ["id", "name"],
    orderBy: [["name", "asc"]],
    limit: 10,
    offset: 10,
});
```

## Row Locking

Lock rows for update within a transaction:

```typescript
await db.transact(async (tx) => {
    const author = await tx.findOne("author", {
        select: ["id", "name"],
        where: { id: 1 },
        for: "update",  // Lock for update
    });

    await tx.updateOne("author", {
        set: { name: "Updated Name" },
        where: { id: author.id },
    });
});
```

Lock modes:
- `"update"` — Exclusive lock
- `"no key update"` — Exclusive lock without blocking foreign key checks
- `"share"` — Shared lock
- `"key share"` — Shared lock allowing non-key updates

## Complete Example

```typescript
import { $gte, $ilike, $or } from "@casekit/orm";

const searchResults = await db.findMany("author", {
    select: ["id", "name", "email", "createdAt"],
    where: {
        [$or]: [
            { name: { [$ilike]: "%jane%" } },
            { email: { [$ilike]: "%jane%" } },
        ],
        createdAt: { [$gte]: new Date("2024-01-01") },
    },
    orderBy: [["name", "asc"]],
    limit: 20,
    offset: 0,
});
```
