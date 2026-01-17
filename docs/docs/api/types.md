---
sidebar_position: 4
---

# Type Reference

TypeScript types exported by @casekit/orm.

## Core Types

### orm

Factory function to create an ORM instance:

```typescript
import { orm, type Config } from "@casekit/orm";

const db = orm(config);
```

### Orm

Type of the ORM instance, parameterized by config:

```typescript
import { orm, type Orm, type Config } from "@casekit/orm";

const config = { /* ... */ } satisfies Config;
type DB = Orm<typeof config>;

const db: DB = orm(config);
```

### Config

Configuration object type:

```typescript
interface Config {
    models: ModelDefinitions;
    schema?: string;
    connection?: ConnectionConfig;
    pool?: boolean;
    naming?: {
        column?: (name: string) => string;
        table?: (name: string) => string;
    };
    extensions?: readonly string[];
    operators?: OperatorDefinitions;
    logger?: Logger;
}
```

## Model Types

### ModelDefinition

Defines a database table:

```typescript
interface ModelDefinition {
    table?: string;
    schema?: string;
    fields: Record<string, FieldDefinition>;
    primaryKey?: string[] | null;
    uniqueConstraints?: UniqueConstraintDefinition[];
    foreignKeys?: ForeignKeyDefinition[];
    relations?: RelationDefinitions;
}
```

### ModelDefinitions

Collection of models:

```typescript
type ModelDefinitions = Record<string, ModelDefinition>;
```

### ModelType

Infer the TypeScript type for a model instance:

```typescript
import { type ModelType } from "@casekit/orm";
import { author } from "./models/author";

type Author = ModelType<typeof author>;
// { id: number; name: string; email: string; ... }
```

### ModelName

Extract model names from definitions:

```typescript
import { type ModelName, type ModelDefinitions } from "@casekit/orm";

type Models = typeof models;
type Name = ModelName<Models>;
// "author" | "book" | "tag" | ...
```

## Field Types

### FieldDefinition

Defines a database column:

```typescript
interface FieldDefinition {
    type: string;              // PostgreSQL type
    column?: string;           // Override column name
    nullable?: boolean;
    default?: unknown;
    unique?: boolean | UniqueOptions;
    primaryKey?: boolean;
    references?: ReferenceOptions;
    zodSchema?: ZodType;
    provided?: boolean;
}
```

### FieldName

Extract field names from a model:

```typescript
import { type FieldName } from "@casekit/orm";

type AuthorField = FieldName<typeof author>;
// "id" | "name" | "email" | "bio" | "createdAt"
```

### FieldType

Infer the TypeScript type for a field:

```typescript
import { type FieldType } from "@casekit/orm";

type AuthorId = FieldType<typeof author, "id">;
// number

type AuthorBio = FieldType<typeof author, "bio">;
// string | null
```

### RequiredField

Fields that must be provided when creating:

```typescript
import { type RequiredField } from "@casekit/orm";

type Required = RequiredField<typeof author>;
// "name" | "email"  (excludes id, createdAt, bio)
```

### OptionalField

Fields that can be omitted when creating:

```typescript
import { type OptionalField } from "@casekit/orm";

type Optional = OptionalField<typeof author>;
// "id" | "bio" | "createdAt"
```

### NullableField

Fields that can be null:

```typescript
import { type NullableField } from "@casekit/orm";

type Nullable = NullableField<typeof author>;
// "bio"
```

## Relation Types

### RelationDefinition

```typescript
type RelationDefinition =
    | OneToManyRelationDefinition
    | ManyToOneRelationDefinition
    | ManyToManyRelationDefinition;

interface OneToManyRelationDefinition {
    type: "1:N";
    model: string;
    fromField: string | string[];
    toField: string | string[];
}

interface ManyToOneRelationDefinition {
    type: "N:1";
    model: string;
    fromField: string | string[];
    toField: string | string[];
    optional?: boolean;
}

interface ManyToManyRelationDefinition {
    type: "N:N";
    model: string;
    through: {
        model: string;
        fromRelation: string;
        toRelation: string;
    };
}
```

### RelationName

Extract relation names from a model:

```typescript
import { type RelationName } from "@casekit/orm";

type AuthorRelation = RelationName<typeof author>;
// "books"
```

### RelationModel

Get the target model for a relation:

```typescript
import { type RelationModel } from "@casekit/orm";

type AuthorBooks = RelationModel<Models, "author", "books">;
// typeof book
```

## Query Types

### FindParams

```typescript
type FindParams<Models, Operators, M> = {
    select: SelectClause<Models[M]>;
    include?: IncludeClause<Models, Operators, M>;
    where?: WhereClause<Models, Operators, M>;
    orderBy?: OrderByClause<Models, M>;
    limit?: number;
    offset?: number;
    for?: "update" | "no key update" | "share" | "key share";
};
```

### CountParams

```typescript
type CountParams<Models, Operators, M> = {
    where?: WhereClause<Models, Operators, M>;
};
```

### CreateOneParams / CreateManyParams

```typescript
type CreateOneParams<Models, M> = {
    values: CreateValues<Models[M]>;
    returning?: ReturningClause<Models[M]>;
    onConflict?: { do: "nothing" };
};

type CreateManyParams<Models, M> = {
    values: CreateValues<Models[M]>[];
    returning?: ReturningClause<Models[M]>;
};
```

### UpdateParams

```typescript
type UpdateParams<Models, Operators, M> = {
    set: UpdateValues<Models[M]>;
    where: WhereClause<Models, Operators, M>;
    returning?: ReturningClause<Models[M]>;
};
```

### DeleteParams

```typescript
type DeleteParams<Models, Operators, M> = {
    where: WhereClause<Models, Operators, M>;
    returning?: ReturningClause<Models[M]>;
};
```

## Result Types

### FindResult

Infer the return type of find queries:

```typescript
type FindResult<Models, Operators, M, Q> = {
    [Field in Q["select"][number]]: FieldType<Models[M], Field>;
} & {
    [Relation in keyof Q["include"]]: /* nested result */
};
```

### CreateOneResult / CreateManyResult

```typescript
type CreateOneResult<Models, M, Q> =
    Q["returning"] extends string[]
        ? { [Field in Q["returning"][number]]: FieldType<Models[M], Field> }
        : number;
```

### UpdateOneResult / UpdateManyResult

```typescript
type UpdateOneResult<Models, Operators, M, Q> =
    Q["returning"] extends string[]
        ? { [Field in Q["returning"][number]]: FieldType<Models[M], Field> }
        : number;
```

### DeleteOneResult / DeleteManyResult

```typescript
type DeleteOneResult<Models, Operators, M, Q> =
    Q["returning"] extends string[]
        ? { [Field in Q["returning"][number]]: FieldType<Models[M], Field> }
        : number;
```

## Middleware Types

### Middleware

```typescript
interface Middleware {
    name?: string;

    // Transform hooks
    where?: (config, modelName, where) => where;
    values?: (config, modelName, values) => values;
    set?: (config, modelName, set) => set;

    // Operation hooks
    findOne?: (db, modelName, query) => Promise<Result>;
    findMany?: (db, modelName, query) => Promise<Result[]>;
    count?: (db, modelName, query) => Promise<number>;
    createOne?: (db, modelName, query) => Promise<Result>;
    createMany?: (db, modelName, query) => Promise<Result[]>;
    updateOne?: (db, modelName, query) => Promise<Result>;
    updateMany?: (db, modelName, query) => Promise<number>;
    deleteOne?: (db, modelName, query) => Promise<Result>;
    deleteMany?: (db, modelName, query) => Promise<number>;
}
```

## Operator Types

### DefaultOperators

Built-in operators interface:

```typescript
interface DefaultOperators<T> {
    [$eq]?: T;
    [$ne]?: T;
    [$gt]?: T;
    [$gte]?: T;
    [$lt]?: T;
    [$lte]?: T;
    [$in]?: T[];
    [$like]?: string;
    [$ilike]?: string;
    [$is]?: null | boolean;
    [$not]?: null;
}
```

## Constraint Types

### UniqueConstraintDefinition

```typescript
interface UniqueConstraintDefinition {
    name?: string;
    fields: string[];
    where?: SQLStatement;
    nullsNotDistinct?: boolean;
}
```

### ForeignKeyDefinition

```typescript
interface ForeignKeyDefinition {
    name?: string;
    fields: string[];
    references: {
        model: string;
        fields: string[];
    };
    onUpdate?: "RESTRICT" | "CASCADE" | "SET NULL" | "SET DEFAULT";
    onDelete?: "RESTRICT" | "CASCADE" | "SET NULL" | "SET DEFAULT";
}
```

## Logger Types

### Logger

```typescript
interface Logger {
    debug(...args: unknown[]): void;
    info(...args: unknown[]): void;
    warn(...args: unknown[]): void;
    error(...args: unknown[]): void;
}
```
