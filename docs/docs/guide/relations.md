---
sidebar_position: 3
---

# Relations

Load related data efficiently using the `include` clause.

## Including Relations

### One-to-Many

Load a parent's children:

```typescript
const author = await db.findOne("author", {
    select: ["id", "name"],
    include: {
        books: {
            select: ["id", "title"],
        },
    },
    where: { name: "Jane Austen" },
});

// author.books is an array of { id, title }
```

### Many-to-One

Load a child's parent:

```typescript
const books = await db.findMany("book", {
    select: ["id", "title"],
    include: {
        author: {
            select: ["id", "name"],
        },
    },
});

// Each book has an author object: { id, name }
```

### Many-to-Many

Load through a junction table:

```typescript
const books = await db.findMany("book", {
    select: ["id", "title"],
    include: {
        tags: {
            select: ["id", "name"],
        },
    },
});

// Each book has a tags array: [{ id, name }, ...]
```

## Nested Includes

Include relations multiple levels deep:

```typescript
const author = await db.findOne("author", {
    select: ["id", "name"],
    include: {
        books: {
            select: ["id", "title"],
            include: {
                tags: {
                    select: ["id", "name"],
                },
            },
        },
    },
    where: { name: "Jane Austen" },
});

// author.books[0].tags is available
```

## Filtering Relations

Apply WHERE clauses to included relations:

```typescript
const author = await db.findOne("author", {
    select: ["id", "name"],
    include: {
        books: {
            select: ["id", "title", "published"],
            where: { published: true },  // Only published books
        },
    },
    where: { name: "Jane Austen" },
});
```

With operators:

```typescript
import { $gte } from "@casekit/orm";

const author = await db.findOne("author", {
    select: ["id", "name"],
    include: {
        books: {
            select: ["id", "title", "publishedAt"],
            where: {
                publishedAt: { [$gte]: new Date("2024-01-01") },
            },
        },
    },
    where: { id: 1 },
});
```

## Ordering Relations

Sort included records:

```typescript
const author = await db.findOne("author", {
    select: ["id", "name"],
    include: {
        books: {
            select: ["id", "title"],
            orderBy: [["title", "asc"]],
        },
    },
    where: { name: "Jane Austen" },
});
```

## Limiting Relations

Limit the number of included records:

```typescript
const author = await db.findOne("author", {
    select: ["id", "name"],
    include: {
        books: {
            select: ["id", "title"],
            limit: 5,  // Only first 5 books
        },
    },
    where: { name: "Jane Austen" },
});
```

## Combining Options

All include options can be combined:

```typescript
const author = await db.findOne("author", {
    select: ["id", "name"],
    include: {
        books: {
            select: ["id", "title", "publishedAt"],
            where: { published: true },
            orderBy: [["publishedAt", "desc"]],
            limit: 10,
        },
    },
    where: { id: 1 },
});
```

## How It Works

The ORM uses PostgreSQL LATERAL JOINs to efficiently load related data:

- **Many-to-One**: Uses standard JOIN, so related records are fetched in a single query
- **One-to-Many / Many-to-Many**: Uses LATERAL subqueries to batch-load related records

This means complex nested queries are efficient and avoid the N+1 problem.

## Example: Blog with Authors, Posts, and Comments

```typescript
const authors = await db.findMany("author", {
    select: ["id", "name"],
    include: {
        posts: {
            select: ["id", "title", "createdAt"],
            include: {
                comments: {
                    select: ["id", "content", "createdAt"],
                    orderBy: [["createdAt", "desc"]],
                    limit: 5,
                },
            },
            where: { published: true },
            orderBy: [["createdAt", "desc"]],
            limit: 10,
        },
    },
    where: { active: true },
    orderBy: [["name", "asc"]],
});
```

This executes as a single optimized query, returning:
- All active authors, sorted by name
- Each author's 10 most recent published posts
- Each post's 5 most recent comments
