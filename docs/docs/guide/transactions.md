---
sidebar_position: 5
---

# Transactions

Group multiple operations into atomic transactions.

## Basic Transactions

Use `transact` to wrap operations in a transaction:

```typescript
await db.transact(async (tx) => {
    const author = await tx.createOne("author", {
        values: {
            name: "Jane Austen",
            email: "jane@example.com",
        },
        returning: ["id"],
    });

    await tx.createOne("book", {
        values: {
            title: "Pride and Prejudice",
            authorId: author.id,
        },
    });
});
// Both author and book are committed together
```

If any operation fails, all changes are rolled back:

```typescript
try {
    await db.transact(async (tx) => {
        await tx.createOne("author", {
            values: {
                name: "Jane Austen",
                email: "jane@example.com",
            },
        });

        // This error causes the entire transaction to roll back
        throw new Error("Something went wrong");
    });
} catch (error) {
    // Transaction was rolled back, author was not created
}
```

## Returning Values

Transactions can return values:

```typescript
const result = await db.transact(async (tx) => {
    const author = await tx.createOne("author", {
        values: {
            name: "Jane Austen",
            email: "jane@example.com",
        },
        returning: ["id", "name"],
    });

    const book = await tx.createOne("book", {
        values: {
            title: "Pride and Prejudice",
            authorId: author.id,
        },
        returning: ["id", "title"],
    });

    return { author, book };
});

// result.author and result.book are available
console.log(result.author.name);  // "Jane Austen"
console.log(result.book.title);   // "Pride and Prejudice"
```

## Force Rollback

For testing, you can force a rollback even on success:

```typescript
await db.transact(
    async (tx) => {
        await tx.createOne("author", {
            values: {
                name: "Test Author",
                email: "test@example.com",
            },
        });

        // Verify within transaction
        const count = await tx.count("author", { where: {} });
        console.log(count);  // 1 inside the transaction
    },
    { rollback: true }  // Force rollback
);

// Nothing was persisted - useful for testing
const count = await db.count("author", { where: {} });
console.log(count);  // 0
```

## Nested Transactions

Nested transactions use PostgreSQL savepoints:

```typescript
await db.transact(async (tx) => {
    const author = await tx.createOne("author", {
        values: {
            name: "Jane Austen",
            email: "jane@example.com",
        },
        returning: ["id"],
    });

    // Nested transaction creates a savepoint
    try {
        await tx.transact(async (inner) => {
            await inner.createOne("book", {
                values: {
                    title: "Failed Book",
                    authorId: author.id,
                },
            });

            throw new Error("Roll back only the book");
        });
    } catch {
        // Inner transaction rolled back to savepoint
        // Author is still created
    }

    // Create a successful book
    await tx.createOne("book", {
        values: {
            title: "Pride and Prejudice",
            authorId: author.id,
        },
    });
});

// Result: Author exists with one book ("Pride and Prejudice")
// "Failed Book" was rolled back
```

## Row Locking

Lock rows within a transaction to prevent concurrent updates:

```typescript
await db.transact(async (tx) => {
    // Lock the author row for update
    const author = await tx.findOne("author", {
        select: ["id", "name"],
        where: { id: 1 },
        for: "update",
    });

    // Other transactions will wait for this lock
    await tx.updateOne("author", {
        set: { name: "Updated Name" },
        where: { id: author.id },
    });
});
```

## Best Practices

### Keep Transactions Short

Long-running transactions hold locks and can cause contention:

```typescript
// ❌ Bad: HTTP call inside transaction
await db.transact(async (tx) => {
    const user = await tx.findOne("user", { ... });
    await fetch("https://api.example.com/notify");  // Slow!
    await tx.updateOne("user", { ... });
});

// ✅ Good: Do slow work outside transaction
const user = await db.findOne("user", { ... });
await fetch("https://api.example.com/notify");
await db.transact(async (tx) => {
    await tx.updateOne("user", { ... });
});
```

### Handle Errors Appropriately

```typescript
try {
    await db.transact(async (tx) => {
        // Operations...
    });
} catch (error) {
    if (error.code === "23505") {
        // Unique violation - handle accordingly
    } else {
        throw error;
    }
}
```

### Use Savepoints for Partial Rollbacks

```typescript
await db.transact(async (tx) => {
    // Critical operation - must succeed
    await tx.createOne("order", { ... });

    // Optional operation - can fail
    try {
        await tx.transact(async (inner) => {
            await inner.createOne("notification", { ... });
        });
    } catch {
        // Notification failed, but order is still created
        console.log("Failed to create notification");
    }
});
```
