---
sidebar_position: 3
---

# Migrations

:::warning[Alpha Feature]
**The migrations functionality is currently in alpha and not ready for production use.** The API may change, and there may be bugs or missing features. Use with caution and always read the generated SQL before running migrations.
:::

Database migrations allow you to evolve your schema over time in a controlled, versioned way. Instead of directly pushing schema changes (which can cause data loss), migrations generate SQL files that can be reviewed, version-controlled, and applied incrementally.

## Overview

The migration system:

1. **Compares** your TypeScript model definitions against the current database state
2. **Generates** SQL migration files with the necessary changes
3. **Tracks** which migrations have been applied
4. **Warns** about potentially unsafe operations

## Commands

### orm generate migration

Generate a new migration from schema changes.

```bash
pnpm orm generate migration --name <description> [options]
```

#### Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--name` | `-n` | Short description for the migration filename (required) |
| `--unsafe` | | Proceed even with unsafe operations without prompting |

#### Example

```bash
pnpm orm generate migration --name add-users-table
```

Output:
```
Generated migration: ./migrations/20240115143022_add-users-table.sql

CREATE SCHEMA IF NOT EXISTS "app";

CREATE TABLE "app"."user" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "email" text NOT NULL,
  "name" text,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_email_key" ON "app"."user" ("email");

✅ Done
```

### orm db migrate

Run all pending migrations.

```bash
pnpm orm db migrate
```

#### Example

```bash
pnpm orm db migrate
```

Output:
```
Applied 2 migration(s):
  - 20240115143022_add-users-table
  - 20240116091500_add-posts-table
✅ Done
```

If already up to date:
```
Already up to date.
```

## Migration Files

Migrations are stored as SQL files in the migrations directory (default: `./migrations`). You can configure this in your `orm.config.ts`:

```typescript
export default {
    db: orm({ ... }),
    directory: "./src/db",
    migrate: {
        migrationsPath: "./migrations",
    },
};
```

### File Format

Migration files are named with a timestamp prefix for ordering:

```
migrations/
├── 20240115143022_add-users-table.sql
├── 20240116091500_add-posts-table.sql
└── 20240120102030_add-user-email-index.sql
```

### Non-Transactional Migrations

Some operations (like `CREATE INDEX CONCURRENTLY`) cannot run inside a transaction. Add a special comment at the top of the migration file:

```sql
-- orm:no-transaction
CREATE INDEX CONCURRENTLY "user_email_idx" ON "app"."user" ("email");
```

## Safety Checks

The migration generator analyzes operations and warns about potentially dangerous changes:

### Unsafe Operations

These operations may cause data loss or application errors:

- **Dropping tables** — Permanent data loss
- **Dropping columns** — Data loss and potential application errors if code still references the column
- **Dropping schemas** — Removes all objects within the schema
- **Unsafe type changes** — Converting between incompatible types (e.g., `text` to `integer`)

### Cautious Operations

These operations may cause issues on large tables:

- **Adding foreign keys** — Validates all existing rows while holding a lock
- **Adding unique constraints** — Blocks writes while building the index
- **Setting NOT NULL** — Scans the entire table while holding a lock

When unsafe operations are detected, you'll be prompted to confirm:

```
🚨 Unsafe operations:
  - Dropping column "legacy_field" from "app"."user" may cause errors if application code still references it.
    Suggestion: Deploy code changes that stop using this column first, then drop it in a subsequent migration.

This migration contains unsafe operations. Do you want to keep it? (y/N)
```

## Column Renames

When the migration generator detects a column being dropped and another added in the same table, it will ask if this is a rename:

```
Column "old_name" is being dropped and "new_name" is being added in "app"."user". Is this a rename? (Y/n)
```

If confirmed, it generates a `RENAME COLUMN` statement instead of separate `DROP` and `ADD` operations, preserving data.

## Migration Tracking

Applied migrations are tracked in a `_orm_migrations` table in the `public` schema:

```sql
CREATE TABLE public._orm_migrations (
    id serial PRIMARY KEY,
    name text NOT NULL UNIQUE,
    applied_at timestamptz NOT NULL DEFAULT now(),
    checksum text NOT NULL
);
```

### Checksum Verification

Migration file checksums are stored when applied. If a migration file is modified after being applied, the next `db migrate` will fail with a checksum mismatch error. This prevents accidentally running modified migrations.

## Workflow

### Typical Development Workflow

```bash
# 1. Make changes to your model definitions

# 2. Generate a migration
pnpm orm generate migration --name describe_your_changes

# 3. Review the generated SQL file

# 4. Apply the migration
pnpm orm db migrate

# 5. Commit both model changes and migration file
git add .
git commit -m "Add user email field"
```

### Team Workflow

1. Each developer generates migrations locally
2. Migration files are committed to version control
3. Migrations are applied in order on all environments
4. The timestamp prefix ensures correct ordering even with parallel development

## Limitations

Current limitations of the alpha migration system:

- No automatic rollback/down migrations
- No migration squashing
- Limited support for complex ALTER operations
- No dry-run mode for `db migrate`
- Extension changes may require manual intervention

## Comparison with db push

| Feature | `db push` | `db migrate` |
|---------|-----------|--------------|
| Safe for production | No | Yes (with caution) |
| Versioned changes | No | Yes |
| Reviewable SQL | No | Yes |
| Data preservation | No guarantee | By design |
| Speed | Fast | Depends on migration |

Use `db push` for rapid development and prototyping. Use migrations when you need controlled, versioned schema changes.
