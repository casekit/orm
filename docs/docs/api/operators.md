---
sidebar_position: 3
---

# Operators

WHERE clause operators for filtering queries.

## Importing Operators

```typescript
import {
    $eq, $ne,
    $gt, $gte, $lt, $lte,
    $in,
    $like, $ilike,
    $is, $not,
    $and, $or,
} from "@casekit/orm";
```

## Comparison Operators

### $eq (Equal)

Exact equality. This is the default for plain values.

```typescript
// These are equivalent:
where: { status: "active" }
where: { status: { [$eq]: "active" } }
```

### $ne (Not Equal)

```typescript
where: {
    status: { [$ne]: "deleted" },
}
```

SQL: `WHERE status != 'deleted'`

### $gt (Greater Than)

```typescript
where: {
    age: { [$gt]: 18 },
}
```

SQL: `WHERE age > 18`

### $gte (Greater Than or Equal)

```typescript
where: {
    publishedAt: { [$gte]: new Date("2024-01-01") },
}
```

SQL: `WHERE published_at >= '2024-01-01'`

### $lt (Less Than)

```typescript
where: {
    price: { [$lt]: 100 },
}
```

SQL: `WHERE price < 100`

### $lte (Less Than or Equal)

```typescript
where: {
    quantity: { [$lte]: 0 },
}
```

SQL: `WHERE quantity <= 0`

## Set Operators

### $in (In Array)

Match any value in an array:

```typescript
where: {
    status: { [$in]: ["active", "pending", "review"] },
}
```

SQL: `WHERE status IN ('active', 'pending', 'review')`

## Pattern Operators

### $like (Case-Sensitive Pattern)

```typescript
where: {
    title: { [$like]: "The %" },  // Starts with "The "
}
```

SQL: `WHERE title LIKE 'The %'`

Pattern wildcards:
- `%` — Match any sequence of characters
- `_` — Match any single character

### $ilike (Case-Insensitive Pattern)

```typescript
where: {
    email: { [$ilike]: "%@gmail.com" },  // Ends with @gmail.com
}
```

SQL: `WHERE email ILIKE '%@gmail.com'`

## NULL and Boolean Operators

### $is

Check for NULL, TRUE, or FALSE:

```typescript
// NULL check
where: {
    deletedAt: { [$is]: null },
}
// SQL: WHERE deleted_at IS NULL

// Boolean check
where: {
    active: { [$is]: true },
}
// SQL: WHERE active IS TRUE

where: {
    verified: { [$is]: false },
}
// SQL: WHERE verified IS FALSE
```

### $not

Negate IS checks:

```typescript
where: {
    deletedAt: { [$not]: null },
}
// SQL: WHERE deleted_at IS NOT NULL
```

## Logical Operators

### $or

Match if ANY condition is true:

```typescript
where: {
    [$or]: [
        { status: "active" },
        { status: "pending" },
    ],
}
```

SQL: `WHERE (status = 'active' OR status = 'pending')`

### $and

Match if ALL conditions are true:

```typescript
where: {
    [$and]: [
        { status: "active" },
        { verified: true },
    ],
}
```

SQL: `WHERE (status = 'active' AND verified = true)`

## Combining Operators

Operators can be combined for complex queries:

```typescript
where: {
    [$or]: [
        { role: "admin" },
        {
            [$and]: [
                { role: "user" },
                { verified: { [$is]: true } },
                { createdAt: { [$gte]: new Date("2024-01-01") } },
            ],
        },
    ],
}
```

SQL:
```sql
WHERE (
    role = 'admin'
    OR (
        role = 'user'
        AND verified IS TRUE
        AND created_at >= '2024-01-01'
    )
)
```

## Multiple Conditions on Same Field

Apply multiple operators to one field:

```typescript
where: {
    age: {
        [$gte]: 18,
        [$lt]: 65,
    },
}
```

SQL: `WHERE age >= 18 AND age < 65`

## Custom Operators

Define custom operators in your config:

```typescript
import { sql } from "@casekit/sql";

const $contains = Symbol("contains");
const $overlaps = Symbol("overlaps");

const config = {
    models,
    operators: {
        where: {
            // Array contains
            [$contains]: (meta, value) =>
                sql`${meta.column} @> ${value}`,

            // Array overlaps
            [$overlaps]: (meta, value) =>
                sql`${meta.column} && ${value}`,
        },
    },
} satisfies Config;
```

Usage:

```typescript
const posts = await db.findMany("post", {
    select: ["id", "title", "tags"],
    where: {
        tags: { [$contains]: ["typescript"] },
    },
});
```

## Operator Reference

| Operator | SQL Equivalent | Example Value |
|----------|---------------|---------------|
| `$eq` | `=` | `"active"` |
| `$ne` | `!=` | `"deleted"` |
| `$gt` | `>` | `18` |
| `$gte` | `>=` | `new Date()` |
| `$lt` | `<` | `100` |
| `$lte` | `<=` | `0` |
| `$in` | `IN (...)` | `["a", "b"]` |
| `$like` | `LIKE` | `"The %"` |
| `$ilike` | `ILIKE` | `"%@gmail%"` |
| `$is` | `IS` | `null`, `true`, `false` |
| `$not` | `IS NOT` | `null` |
| `$and` | `AND` | `[clause, clause]` |
| `$or` | `OR` | `[clause, clause]` |
