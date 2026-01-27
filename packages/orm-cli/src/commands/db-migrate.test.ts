import { fs, vol } from "memfs";
import { randomUUID } from "node:crypto";
import pg from "pg";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import yargs from "yargs";

import { orm, sql } from "@casekit/orm";
import { unindent } from "@casekit/unindent";

import { globalOptions } from "#options.js";
import { OrmCLIConfig } from "#types.js";
import * as loadConfig from "#util/loadConfig.js";
import { dbMigrate } from "./db-migrate.js";
import { dbPush } from "./db-push.js";
import { generateMigration } from "./generate-migration.js";

describe("db migrate", () => {
    const schema = `orm_migrate_${randomUUID().replace(/-/g, "_")}`;
    let db: pg.Client;

    const migrationsPath = "/project/migrations";

    beforeEach(async () => {
        db = new pg.Client();
        await db.connect();
        await db.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);

        vi.spyOn(process, "cwd").mockReturnValue("/project");

        vol.fromJSON(
            {
                "orm.config.ts": "// placeholder",
            },
            "/project",
        );
    });

    afterEach(async () => {
        await db.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
        await db.query(`DROP TABLE IF EXISTS public._orm_migrations`);
        await db.end();
        vol.reset();
        vi.restoreAllMocks();
    });

    test("generates migration for new table", async () => {
        const user = {
            schema,
            fields: {
                id: {
                    type: "uuid",
                    primaryKey: true,
                    default: sql`gen_random_uuid()`,
                },
                email: { type: "text", unique: true },
                name: { type: "text", nullable: true },
            },
        } as const;

        const config = {
            db: orm({ schema, models: { user } }),
            directory: "./app/db.server",
            migrate: { migrationsPath },
        } satisfies OrmCLIConfig;

        await config.db.connect();
        vi.spyOn(loadConfig, "loadConfig").mockResolvedValue(config);

        await yargs()
            .options(globalOptions)
            .command(generateMigration)
            .parseAsync("migration --name create_users --unsafe");

        await config.db.close();

        const migrations = fs.readdirSync(migrationsPath) as string[];
        expect(migrations.length).toBe(1);
        expect(migrations[0]).toMatch(/^\d{14}_create-users\.sql$/);

        const content = fs.readFileSync(
            `${migrationsPath}/${migrations[0]}`,
            "utf8",
        ) as string;

        expect(content.trim()).toEqual(
            unindent`
            CREATE SCHEMA IF NOT EXISTS "${schema}";

            CREATE TABLE "${schema}"."user" (
              "id" uuid NOT NULL DEFAULT gen_random_uuid(),
              "email" text NOT NULL,
              "name" text,
              PRIMARY KEY ("id")
            );
        `,
        );
    });

    test("runs pending migrations", async () => {
        const user = {
            schema,
            fields: {
                id: {
                    type: "uuid",
                    primaryKey: true,
                    default: sql`gen_random_uuid()`,
                },
                email: { type: "text", unique: true },
                name: { type: "text", nullable: true },
            },
        } as const;

        const config = {
            db: orm({ schema, models: { user } }),
            directory: "./app/db.server",
            migrate: { migrationsPath },
        } satisfies OrmCLIConfig;

        await config.db.connect();
        vi.spyOn(loadConfig, "loadConfig").mockResolvedValue(config);

        await yargs()
            .options(globalOptions)
            .command(generateMigration)
            .parseAsync("migration --name create_users --unsafe");

        await yargs()
            .options(globalOptions)
            .command(dbMigrate)
            .parseAsync("migrate");

        await config.db.close();

        const result = await db.query(
            `
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = $1 AND table_name = 'user'
            ORDER BY ordinal_position
        `,
            [schema],
        );

        expect(result.rows.map((r) => r.column_name)).toEqual([
            "id",
            "email",
            "name",
        ]);

        const migrationRecord = await db.query(`
            SELECT name, checksum FROM public._orm_migrations
        `);
        expect(migrationRecord.rows.length).toBe(1);
        expect(migrationRecord.rows[0].name).toMatch(/^\d{14}_create-users$/);
    });

    test("returns no changes when schema is in sync", async () => {
        const user = {
            schema,
            fields: {
                id: { type: "uuid", primaryKey: true },
            },
        } as const;

        const config = {
            db: orm({ schema, models: { user } }),
            directory: "./app/db.server",
            migrate: { migrationsPath },
        } satisfies OrmCLIConfig;

        await config.db.connect();
        vi.spyOn(loadConfig, "loadConfig").mockResolvedValue(config);

        await yargs().options(globalOptions).command(dbPush).parseAsync("push");

        const consoleSpy = vi.spyOn(console, "log");

        await yargs()
            .options(globalOptions)
            .command(generateMigration)
            .parseAsync("migration --name no_changes --unsafe");

        expect(consoleSpy).toHaveBeenCalledWith("No changes detected.");

        await config.db.close();
    });

    test("generates incremental migration for schema changes", async () => {
        const userV1 = {
            schema,
            fields: {
                id: { type: "uuid", primaryKey: true },
                email: { type: "text" },
            },
        } as const;

        const configV1 = {
            db: orm({ schema, models: { user: userV1 } }),
            directory: "./app/db.server",
            migrate: { migrationsPath },
        } satisfies OrmCLIConfig;

        await configV1.db.connect();
        vi.spyOn(loadConfig, "loadConfig").mockResolvedValue(configV1);

        await yargs().options(globalOptions).command(dbPush).parseAsync("push");
        await configV1.db.close();

        const userV2 = {
            schema,
            fields: {
                id: { type: "uuid", primaryKey: true },
                email: { type: "text" },
                createdAt: { type: "timestamptz", default: sql`now()` },
            },
        } as const;

        const configV2 = {
            db: orm({ schema, models: { user: userV2 } }),
            directory: "./app/db.server",
            migrate: { migrationsPath },
        } satisfies OrmCLIConfig;

        await configV2.db.connect();
        vi.spyOn(loadConfig, "loadConfig").mockResolvedValue(configV2);

        await yargs()
            .options(globalOptions)
            .command(generateMigration)
            .parseAsync("migration --name add_created_at --unsafe");

        await configV2.db.close();

        const migrations = fs.readdirSync(migrationsPath) as string[];
        expect(migrations.length).toBe(1);
        expect(migrations[0]).toMatch(/^\d{14}_add-created-at\.sql$/);

        const content = fs.readFileSync(
            `${migrationsPath}/${migrations[0]}`,
            "utf8",
        ) as string;

        expect(content.trim()).toEqual(
            unindent`
            ALTER TABLE "${schema}"."user" ADD COLUMN "createdAt" timestamptz NOT NULL DEFAULT now();
        `,
        );
    });

    test("multiple migrations are applied in order", async () => {
        const user = {
            schema,
            fields: {
                id: { type: "uuid", primaryKey: true },
            },
        } as const;

        const config = {
            db: orm({ schema, models: { user } }),
            directory: "./app/db.server",
            migrate: { migrationsPath },
        } satisfies OrmCLIConfig;

        await config.db.connect();
        vi.spyOn(loadConfig, "loadConfig").mockResolvedValue(config);

        fs.mkdirSync(migrationsPath, { recursive: true });
        fs.writeFileSync(
            `${migrationsPath}/20240101000000_first.sql`,
            `CREATE TABLE "${schema}"."first_table" (id serial PRIMARY KEY);`,
        );
        fs.writeFileSync(
            `${migrationsPath}/20240101000001_second.sql`,
            `CREATE TABLE "${schema}"."second_table" (id serial PRIMARY KEY);`,
        );

        await yargs()
            .options(globalOptions)
            .command(dbMigrate)
            .parseAsync("migrate");

        await config.db.close();

        const tables = await db.query(
            `
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = $1
            ORDER BY table_name
        `,
            [schema],
        );

        expect(tables.rows.map((r) => r.table_name)).toEqual([
            "first_table",
            "second_table",
        ]);

        const migrationRecords = await db.query(`
            SELECT name FROM public._orm_migrations ORDER BY id
        `);
        expect(migrationRecords.rows.map((r) => r.name)).toEqual([
            "20240101000000_first",
            "20240101000001_second",
        ]);
    });

    test("already up to date when no pending migrations", async () => {
        const user = {
            schema,
            fields: {
                id: { type: "uuid", primaryKey: true },
            },
        } as const;

        const config = {
            db: orm({ schema, models: { user } }),
            directory: "./app/db.server",
            migrate: { migrationsPath },
        } satisfies OrmCLIConfig;

        await config.db.connect();
        vi.spyOn(loadConfig, "loadConfig").mockResolvedValue(config);

        await yargs()
            .options(globalOptions)
            .command(generateMigration)
            .parseAsync("migration --name create_users --unsafe");

        await yargs()
            .options(globalOptions)
            .command(dbMigrate)
            .parseAsync("migrate");

        const consoleSpy = vi.spyOn(console, "log");

        await yargs()
            .options(globalOptions)
            .command(dbMigrate)
            .parseAsync("migrate");

        expect(consoleSpy).toHaveBeenCalledWith("Already up to date.");

        await config.db.close();
    });
});
