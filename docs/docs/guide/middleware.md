---
sidebar_position: 6
---

# Middleware

Middleware allows you to intercept and transform queries across your application.

## Using Middleware

Apply middleware to create a new ORM instance with modified behavior:

```typescript
const dbWithMiddleware = db.middleware([
    tenancy({ org: currentOrg }),
    userstamps({ user: currentUser }),
]);

// All queries through dbWithMiddleware are transformed
const posts = await dbWithMiddleware.findMany("post", {
    select: ["id", "title"],
});
```

## Example Middleware

### tenancy

```typescript 
export const tenancy = ({ org }: { org: Organisation }): Middleware => ({
    where: (config, modelName, where) => {
        if ("organisationId" in getModel(config.models, modelName).fields) {
            return { ...where, organisaitonId: org.id };
        } else {
            return where;
        }
    },
    values: (config, modelName, values) => {
        if ("organisationId" in getModel(config.models, modelName).fields) {
            return { ...values, organisationId: org.id };
        } else {
            return values;
        }
    },
});


const dbTenant = db.middleware([
    tenancy({ org: currentOrg }),
]);

// All queries automatically filter by orgId
const posts = await dbTenant.findMany("post", {
    select: ["id", "title"],
    // WHERE orgId = currentOrg.id is automatically added
});
```

### userstamps

```typescript
export const userstamps = ({ user }: { user: User }): Middleware => ({
    values: (config, modelName, values) => {
        if ("createdById" in getModel(config.models, modelName).fields) {
            return { ...values, updatedById: values["createdById"] ?? user.id };
        } else {
            return values;
        }
    },
    set: (config, modelName, set) => {
        if ("updatedById" in getModel(config.models, modelName).fields) {
            return { ...set, updatedById: set["updatedById"] ?? user.id };
        } else {
            return set;
        }
    },
});

const dbWithMiddleware = db.middleware([
    tenancy({ org }), // add a where clause on organisationId to every table that has an organisationId column
    userstamps({ user: currentUser }), // Auto-set created_by/updated_by
]);
```

Automatically set `createdBy` and `updatedBy` fields:

```typescript
import { userstamps } from "@casekit/orm";

const dbUser = db.middleware([
    userstamps({ user: currentUser }),
]);

// Creates automatically set createdBy
await dbUser.createOne("post", {
    values: { title: "My Post", content: "..." },
    // createdBy = currentUser.id is automatically added
});

// Updates automatically set updatedBy
await dbUser.updateOne("post", {
    set: { title: "Updated Title" },
    where: { id: 1 },
    // updatedBy = currentUser.id is automatically added
});
```

## Middleware Hooks

Middleware can intercept different aspects of queries:

### where

Transform WHERE clauses for read operations:

```typescript
const middleware: Middleware = {
    where: (config, modelName, where) => {
        // Transform the where clause
        return {
            ...where,
            active: true,  // Add active filter
        };
    },
};
```

### values

Transform values for CREATE operations:

```typescript
const middleware: Middleware = {
    values: (config, modelName, values) => {
        return {
            ...values,
            createdAt: new Date(),  // Add timestamp
        };
    },
};
```

### set

Transform SET values for UPDATE operations:

```typescript
const middleware: Middleware = {
    set: (config, modelName, set) => {
        return {
            ...set,
            updatedAt: new Date(),  // Add timestamp
        };
    },
};
```

### Operation Hooks

Override entire operations:

```typescript
const middleware: Middleware = {
    findOne: async (db, modelName, query) => {
        console.log(`Finding ${modelName}`, query);
        // Call the original or return custom data
        return db.findOne(modelName, query);
    },

    createOne: async (db, modelName, query) => {
        console.log(`Creating ${modelName}`, query);
        return db.createOne(modelName, query);
    },

    // Also: findMany, count, createMany, updateOne, updateMany, deleteOne, deleteMany
};
```

## Combining Middleware

Apply multiple middleware in order:

```typescript
const db = orm(config).middleware([
    tenancy({ org }),      // Applied first
    userstamps({ user }),  // Applied second
    auditLog,              // Applied third
]);
```

Transformations are composed, so a query goes through each middleware's `where`, `values`, or `set` function in order.

## Model Restriction

Restrict access to specific models:

```typescript
const userDb = db.restrict(["user", "profile"]);

// ✅ These work
await userDb.findMany("user", { ... });
await userDb.findMany("profile", { ... });

// ❌ This throws at runtime
await userDb.findMany("post", { ... });  // Error!
```

Useful for creating scoped database instances in multi-tenant applications - for example allowing limited access to a set of global tables shared between tenants.
