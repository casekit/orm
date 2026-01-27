---
sidebar_position: 1
---

# CLI Commands

Reference for all CLI commands.

## Global Options

All commands support these options:

| Option | Alias | Description |
|--------|-------|-------------|
| `--config` | `-c` | Path to config file (default: `orm.config.ts`) |
| `--force` | `-f` | Skip prompts and overwrite files |

## orm init

Initialize a new project with ORM configuration.

```bash
pnpm orm init [options]
```

### Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--directory` | `-d` | Location for database configuration |
| `--force` | `-f` | Overwrite existing files |

### Example

```bash
pnpm orm init --directory ./src/db
```

### Generated Files

- **`{directory}/index.ts`** — Database connection with environment handling
- **`{directory}/models/index.ts`** — Model barrel export
- **`orm.config.ts`** — CLI configuration file (in project root)

## orm db push

:::warning
**DANGER** DO NOT USE THIS ON A PRODUCTION DATABASE, OR DATA LOSS MAY OCCUR.
:::

This command is for development only. For production environments, use [migrations](./migrations.md) instead.

Push the schema to the database, creating tables and constraints.

```bash
pnpm orm db push
```

This command:
1. Creates schemas if they don't exist
2. Creates PostgreSQL extensions
3. Creates tables with all fields
4. Creates foreign key constraints
5. Creates unique constraints

### Example

```bash
pnpm orm db push
```

Output:
```
Pushing schemas public to database
 - Creating schema "public"
 - Creating table "public"."author"
 - Creating table "public"."book"
 - Creating foreign key constraint "book_author_id_fkey" ON "book"
 - Creating unique constraint "author_email_ukey" ON "public"."author"
✅ Done
```

## orm db pull

Introspect the database and generate model files.

```bash
pnpm orm db pull [options]
```

### Options

| Option | Description |
|--------|-------------|
| `--schema` | Schema(s) to pull from (can specify multiple) |
| `--force` | Overwrite existing model files |

### Example

```bash
# Pull from default schema
pnpm orm db pull

# Pull from specific schemas
pnpm orm db pull --schema public --schema audit

# Force overwrite
pnpm orm db pull --force
```

### Generated Files

Creates a model file for each table:

```
src/db/models/
├── author.ts
├── book.ts
├── tag.ts
├── bookTag.ts
└── index.ts  (updated with exports)
```

### What Gets Generated

- Field definitions with types, nullability, defaults
- Primary keys (single and composite)
- Unique constraints
- Foreign key references
- Relations (inferred from foreign keys)

## orm db drop

Drop all schemas used by your models.

```bash
pnpm orm db drop
```

:::warning
This is a destructive operation that deletes all data. Use with caution.
:::

### Example

```bash
pnpm orm db drop
```

Output:
```
 - Dropping schema public
✅ Done
```

## orm generate model

Generate a skeleton model file.

```bash
pnpm orm generate model <name> [options]
```

### Arguments

| Argument | Description |
|----------|-------------|
| `name` | Name of the model to create |

### Options

| Option | Description |
|--------|-------------|
| `--force` | Overwrite existing model file |

### Example

```bash
pnpm orm generate model user
```

Creates `src/db/models/user.ts`:

```typescript
import type { ModelDefinition } from "@casekit/orm";

export const user = {
    fields: {},
} as const satisfies ModelDefinition;
```

And updates `src/db/models/index.ts` to export it.

## Typical Workflow

### Code-First (Write Models, Push to Database)

```bash
# 1. Initialize project
pnpm orm init --directory ./src/db

# 2. Write your models in ./src/db/models/

# 3. Push schema to database
pnpm orm db push
```

### Database-First (Generate Models from Database)

```bash
# 1. Initialize project
pnpm orm init --directory ./src/db

# 2. Pull schema from existing database
pnpm orm db pull --schema public

# 3. Customize generated models as needed
```

### Reset Database

```bash
# Drop and recreate
pnpm orm db drop && pnpm orm db push
```
