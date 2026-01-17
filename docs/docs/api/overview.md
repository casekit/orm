---
sidebar_position: 1
---

# API Overview

Complete reference for the @casekit/orm API.

## Creating an ORM Instance

```typescript
import { orm, type Config } from "@casekit/orm";

const db = orm(config);
await db.connect();
```

## Core Methods

### Query Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `findOne(model, query)` | Find a single record | Typed object (throws if not found) |
| `findMany(model, query)` | Find multiple records | Typed object array |
| `count(model, query)` | Count matching records | Number |

### Mutation Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `createOne(model, query)` | Insert one record | Returned fields or row count |
| `createMany(model, query)` | Insert multiple records | Returned fields or row count |
| `updateOne(model, query)` | Update exactly one record | Returned fields or row count |
| `updateMany(model, query)` | Update multiple records | Returned fields or row count |
| `deleteOne(model, query)` | Delete exactly one record | Returned fields or row count |
| `deleteMany(model, query)` | Delete multiple records | Row count |

### Connection Methods

| Method | Description |
|--------|-------------|
| `connect()` | Establish database connection |
| `close()` | Close database connection |
| `transact(fn, options?)` | Execute operations in a transaction |
| `query(schema, sql)` | Execute raw SQL with type safety |

### Utility Methods

| Method | Description |
|--------|-------------|
| `middleware(middlewares)` | Apply middleware, returns new ORM instance |
| `restrict(models)` | Restrict access to specific models |

## Query Parameters

### FindParams

```typescript
interface FindParams {
    select: string[];                    // Required: fields to return
    include?: IncludeClause;             // Optional: related records
    where?: WhereClause;                 // Optional: filter conditions
    orderBy?: [string, "asc" | "desc"][]; // Optional: sort order
    limit?: number;                      // Optional: max records
    offset?: number;                     // Optional: skip records
    for?: "update" | "no key update" | "share" | "key share"; // Row locking
}
```

### CountParams

```typescript
interface CountParams {
    where?: WhereClause;  // Optional: filter conditions
}
```

### CreateOneParams

```typescript
interface CreateOneParams {
    values: Record<string, any>;    // Required: field values
    returning?: string[];           // Optional: fields to return
    onConflict?: { do: "nothing" }; // Optional: conflict handling
}
```

### CreateManyParams

```typescript
interface CreateManyParams {
    values: Record<string, any>[];  // Required: array of field values
    returning?: string[];           // Optional: fields to return
}
```

### UpdateParams

```typescript
interface UpdateParams {
    set: Record<string, any>;  // Required: fields to update
    where: WhereClause;        // Required: filter conditions
    returning?: string[];      // Optional: fields to return
}
```

### DeleteParams

```typescript
interface DeleteParams {
    where: WhereClause;    // Required: filter conditions
    returning?: string[];  // Optional: fields to return
}
```

## Include Clause

Load related records:

```typescript
include: {
    relationName: {
        select: string[];              // Required: fields to return
        include?: IncludeClause;       // Optional: nested relations
        where?: WhereClause;           // Optional: filter
        orderBy?: [string, "asc" | "desc"][];
        limit?: number;
        offset?: number;
    }
}
```

## Where Clause

Filter records using operators:

```typescript
where: {
    field: value,                    // Equality
    field: { [$operator]: value },   // Comparison
    [$or]: [clause, clause],         // OR logic
    [$and]: [clause, clause],        // AND logic
}
```

## Transaction Options

```typescript
interface TransactOptions {
    rollback?: boolean;  // Force rollback (for testing)
}
```

## Type Exports

```typescript
import {
    // Core
    orm,
    Orm,
    Config,

    // Model types
    ModelDefinition,
    ModelDefinitions,
    ModelType,
    ModelName,

    // Field types
    FieldDefinition,
    FieldName,
    FieldType,
    RequiredField,
    OptionalField,
    NullableField,

    // Relation types
    RelationDefinition,
    RelationName,
    RelationModel,

    // Query types
    FindParams,
    CountParams,
    CreateOneParams,
    CreateManyParams,
    UpdateParams,
    DeleteParams,

    // Clause types
    WhereClause,
    SelectClause,
    IncludeClause,
    OrderByClause,
    ReturningClause,

    // Middleware
    Middleware,

    // Operators
    $eq, $ne, $gt, $gte, $lt, $lte,
    $in, $like, $ilike, $is, $not, $and, $or,
    DefaultOperators,
} from "@casekit/orm";
```
