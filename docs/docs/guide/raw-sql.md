---
sidebar_position: 7
---

# Raw SQL

For complex queries that don't fit the ORM's query builder, use raw SQL with type safety.

## Basic Queries

Use the `query` method with a Zod schema:

```typescript
import { z } from "zod";
import { sql } from "@casekit/sql";

const results = await db.query(
    z.object({
        id: z.number(),
        name: z.string(),
        bookCount: z.number(),
    }),
    sql`
        SELECT
            a.id,
            a.name,
            COUNT(b.id) as book_count
        FROM authors a
        LEFT JOIN books b ON b.author_id = a.id
        GROUP BY a.id, a.name
    `
);
```

The result is fully typed based on your Zod schema.

## Template Literals

Use template literals to safely interpolate values:

```typescript
const authorId = 1;

const books = await db.query(
    z.object({ id: z.number(), title: z.string() }),
    sql`SELECT id, title FROM books WHERE author_id = ${authorId}`
);
```

Values are automatically parameterized to prevent SQL injection.

## Multiple Values

Interpolate multiple values:

```typescript
const minDate = new Date("2024-01-01");
const status = "published";

const posts = await db.query(
    z.object({ id: z.number(), title: z.string() }),
    sql`
        SELECT id, title
        FROM posts
        WHERE created_at >= ${minDate}
        AND status = ${status}
    `
);
```

## Identifiers

Use `sql.ident` for safe identifier interpolation:

```typescript
const tableName = "users";
const columnName = "email";

const results = await db.query(
    z.object({ email: z.string() }),
    sql`SELECT ${sql.ident(columnName)} FROM ${sql.ident(tableName)}`
);
```

## Arrays

Use `sql.array` for array values:

```typescript
const ids = [1, 2, 3];

const authors = await db.query(
    z.object({ id: z.number(), name: z.string() }),
    sql`SELECT id, name FROM authors WHERE id = ANY(${sql.array(ids)})`
);
```

## Composing SQL

Combine SQL fragments:

```typescript
const baseQuery = sql`SELECT id, name FROM authors`;
const whereClause = sql`WHERE active = true`;
const orderClause = sql`ORDER BY name ASC`;

const authors = await db.query(
    z.object({ id: z.number(), name: z.string() }),
    sql`${baseQuery} ${whereClause} ${orderClause}`
);
```

## Aggregations

Raw SQL is ideal for complex aggregations:

```typescript
const stats = await db.query(
    z.object({
        totalAuthors: z.number(),
        totalBooks: z.number(),
        avgBooksPerAuthor: z.number(),
        mostProlificAuthor: z.string(),
    }),
    sql`
        WITH author_stats AS (
            SELECT
                a.name,
                COUNT(b.id) as book_count
            FROM authors a
            LEFT JOIN books b ON b.author_id = a.id
            GROUP BY a.id, a.name
        )
        SELECT
            (SELECT COUNT(*) FROM authors) as total_authors,
            (SELECT COUNT(*) FROM books) as total_books,
            (SELECT AVG(book_count) FROM author_stats) as avg_books_per_author,
            (SELECT name FROM author_stats ORDER BY book_count DESC LIMIT 1) as most_prolific_author
    `
);
```

## Transactions

Raw SQL works within transactions:

```typescript
await db.transact(async (tx) => {
    // Mix ORM operations with raw SQL
    const author = await tx.createOne("author", {
        values: { name: "Jane Austen", email: "jane@example.com" },
        returning: ["id"],
    });

    // Use raw SQL for complex operations
    await tx.query`
        INSERT INTO author_stats (author_id, views, likes)
        VALUES (${author.id}, 0, 0)
    `;
});
```

## Without Schema Validation

For queries where you don't need result validation:

```typescript
// Returns unknown[]
const results = await db.query`
    SELECT id, name FROM authors
`;
```

## Best Practices

### Use Raw SQL For

- Complex aggregations and analytics
- Recursive CTEs
- Window functions
- Full-text search
- Operations not supported by the query builder

### Use the Query Builder For

- Standard CRUD operations
- Type-safe queries and results
- Relational data loading
- Simple filtering and sorting

### Type Safety

Always define a Zod schema for raw SQL queries to get type safety:

```typescript
// ✅ Good: Typed result
const results = await db.query(
    z.object({ count: z.number() }),
    sql`SELECT COUNT(*) as count FROM authors`
);
console.log(results[0].count);  // number

// ⚠️ Less safe: Untyped result
const untyped = await db.query(
    sql`SELECT COUNT(*) as count FROM authors`
);
console.log(untyped[0].count);  // unknown
```

## Creating a typed SQL statement to use later

You can pass a zod schema to the `sql` tagged template literal to get a query with a zod schema attached that you can pass to db.query() later, and get a properly typed result.

```typescript
const BookCountResult = z.object({
    name: z.string(),
    total: z.number(),
})

const booksQuery = sql(BookCountResult)`
  select
    first_name || last_name as name,
    count(1) as total
  from books;
`;

const totals = await db.query(booksQuery)
// => { name: string, total: number }[]
```