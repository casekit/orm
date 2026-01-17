---
sidebar_position: 4
---

# Mutations

Create, update, and delete records with type-safe mutations.

## Creating Records

### createOne

Insert a single record:

```typescript
const author = await db.createOne("author", {
    values: {
        name: "Jane Austen",
        email: "jane@example.com",
        bio: "English novelist",
    },
    returning: ["id", "name", "createdAt"],
});

// author is { id: number, name: string, createdAt: Date }
```

Without `returning`, the method returns the number of affected rows:

```typescript
const count = await db.createOne("author", {
    values: {
        name: "Jane Austen",
        email: "jane@example.com",
    },
});

// count is 1
```

### createMany

Insert multiple records:

```typescript
const authors = await db.createMany("author", {
    values: [
        { name: "Jane Austen", email: "jane@example.com" },
        { name: "Charles Dickens", email: "charles@example.com" },
        { name: "Virginia Woolf", email: "virginia@example.com" },
    ],
    returning: ["id", "name"],
});

// authors is an array of { id, name }
```

### Handling Conflicts

Use `onConflict` to handle unique constraint violations:

```typescript
const result = await db.createOne("author", {
    values: {
        name: "Jane Austen",
        email: "jane@example.com",  // Might already exist
    },
    onConflict: { do: "nothing" },
});

// result is 0 if the email already existed
```

## Updating Records

### updateOne

Update exactly one record. Throws if the WHERE clause matches 0 or 2+ records:

```typescript
const updated = await db.updateOne("author", {
    set: {
        bio: "English novelist known for romantic fiction",
    },
    where: { id: 1 },
    returning: ["id", "name", "bio"],
});
```

### updateMany

Update multiple records:

```typescript
const count = await db.updateMany("book", {
    set: { published: true },
    where: { authorId: 1 },
});

// count is the number of updated rows
```

With returning:

```typescript
const updated = await db.updateMany("book", {
    set: { published: true },
    where: { authorId: 1 },
    returning: ["id", "title"],
});

// updated is an array of { id, title }
```

## Deleting Records

### deleteOne

Delete exactly one record. Throws if the WHERE clause matches 0 or 2+ records:

```typescript
const deleted = await db.deleteOne("author", {
    where: { id: 1 },
    returning: ["id", "name"],
});
```

### deleteMany

Delete multiple records:

```typescript
const count = await db.deleteMany("author", {
    where: {
        name: { [$in]: ["Author 1", "Author 2"] },
    },
});

// count is the number of deleted rows
```

## Required Fields

When creating records, the ORM knows which fields are required based on your model definition:

- Fields with `nullable: true` are optional
- Fields with a `default` value are optional
- Serial fields are optional (auto-generated)
- Fields with `provided: true` are optional (set by middleware)
- All other fields are required

```typescript
const user = {
    fields: {
        id: { type: "serial", primaryKey: true },           // Optional (serial)
        email: { type: "text" },                            // Required
        name: { type: "text" },                             // Required
        bio: { type: "text", nullable: true },              // Optional (nullable)
        createdAt: { type: "timestamptz", default: sql`now()` }, // Optional (default)
        orgId: { type: "uuid", provided: true },            // Optional (middleware)
    },
} as const satisfies ModelDefinition;

// When creating:
await db.createOne("user", {
    values: {
        email: "user@example.com",  // Required
        name: "User",               // Required
        // bio, createdAt, orgId are optional
    },
});
```

## Update Values

When updating, all fields are optional in the `set` clause:

```typescript
await db.updateOne("author", {
    set: {
        // Only update the fields you want to change
        name: "New Name",
    },
    where: { id: 1 },
});
```

## Type Safety

The ORM provides full type safety for mutations:

```typescript
// ✅ Type-safe: TypeScript knows `name` is a string
await db.createOne("author", {
    values: {
        name: "Jane Austen",
        email: "jane@example.com",
    },
});

// ❌ Type error: `age` is not a valid field
await db.createOne("author", {
    values: {
        name: "Jane Austen",
        age: 25,  // Error!
    },
});

// ❌ Type error: missing required field
await db.createOne("author", {
    values: {
        name: "Jane Austen",
        // Missing email!
    },
});
```
