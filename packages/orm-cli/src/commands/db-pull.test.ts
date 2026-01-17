import * as prompts from "@inquirer/prompts";
import { fs, vol } from "memfs";
import { randomUUID } from "node:crypto";
import pg from "pg";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import yargs from "yargs";

import { orm, sql } from "@casekit/orm";
import { unindent } from "@casekit/unindent";

import { globalOptions } from "#options.js";
import * as loadConfig from "#util/loadConfig.js";
import { dbPull } from "./db-pull.js";
import { dbPush } from "./db-push.js";

describe("db pull", () => {
    const schema = `orm_${randomUUID()}`;
    let db: pg.Client;

    beforeEach(async () => {
        db = new pg.Client();
        await db.connect();

        await db.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);

        // Mock filesystem
        vi.spyOn(process, "cwd").mockReturnValue("/project");

        const userModelContent = unindent`
            import { type ModelDefinition, sql } from "@casekit/orm";
            
            export const user = {
                fields: {
                    id: { type: "uuid", primaryKey: true },
                    createdAt: { type: "timestamp", default: sql\`now()\` },
                    email: { type: "text", unique: true },
                    name: { type: "text", nullable: true },
                },
            } as const satisfies ModelDefinition;
        `;

        vol.fromJSON(
            {
                "orm.config.ts": unindent`
                    import { orm } from "@casekit/orm";
                    import { user } from "./app/db.server/models/user.ts";
                    
                    export default {
                        db: orm({
                            schema: "${schema}",
                            models: { user },
                        }),
                        directory: "./app/db.server",
                    };
                `,
                "app/db.server/models/user.ts": userModelContent,
            },
            "/project",
        );

        // Mock the specific config file path to return the memfs content
        vi.doMock("/project/orm.config.ts", () => {
            const userContent = fs.readFileSync(
                "/project/app/db.server/models/user.ts",
                "utf8",
            ) as string;

            // Extract the user object from the file content
            const userMatch =
                /export const user = ({[\s\S]*}) as const satisfies ModelDefinition;/.exec(
                    userContent,
                );
            if (!userMatch) {
                throw new Error("Could not extract user from model file");
            }

            // Dynamic evaluation to get the user object
            // eslint-disable-next-line @typescript-eslint/no-implied-eval
            const user = new Function("sql", "orm", `return ${userMatch[1]}`)(
                sql,
                orm,
            );

            return {
                default: {
                    db: orm({
                        schema,
                        models: { user },
                    }),
                    directory: "./app/db.server",
                },
            };
        });

        // Import the mocked config
        const path = "/project/orm.config.ts";
        const { default: config } = await import(path);
        await config.db.connect();
        process.on("exit", async function () {
            await config.db.close();
        });
        vi.spyOn(loadConfig, "loadConfig").mockResolvedValue(config);
    });

    afterEach(async () => {
        await db.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
        await db.end();
        vol.reset();
        vi.restoreAllMocks();
    });

    test("creates model files for tables in the specified schema", async () => {
        // Set up database schema
        // await yargs().options(globalOptions).command(dbDrop).parseAsync("drop");
        await yargs().options(globalOptions).command(dbPush).parseAsync("push");

        await db.query(`
            CREATE TABLE "${schema}".post (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                title TEXT NOT NULL,
                content TEXT,
                created_at TIMESTAMP DEFAULT now()
            );
        `);

        // Mock prompts to auto-confirm file writes
        vi.spyOn(prompts, "confirm").mockResolvedValue(true);

        // Run db-pull
        await yargs()
            .options(globalOptions)
            .command(dbPull)
            .parseAsync(`pull --schema ${schema}`);

        // Check that post model was created
        const postModel = fs.readFileSync(
            "/project/app/db.server/models/post.ts",
            "utf8",
        ) as string;

        expect(postModel.trim()).toEqual(unindent`
            import { type ModelDefinition, sql } from "@casekit/orm";

            export const post = {
                schema: "${schema}",
                fields: {
                    id: { type: "uuid", primaryKey: true, default: sql\`gen_random_uuid()\` },
                    title: { type: "text" },
                    content: { type: "text", nullable: true },
                    createdAt: {
                        column: "created_at",
                        type: "timestamp without time zone",
                        nullable: true,
                        default: sql\`now()\`,
                    },
                },
            } as const satisfies ModelDefinition;
        `);
    });

    test("handles multiple schemas", async () => {
        // Set up database with multiple schemas
        const schema1 = `schema1_${randomUUID()}`;
        const schema2 = `schema2_${randomUUID()}`;

        await db.query(`CREATE SCHEMA IF NOT EXISTS "${schema1}"`);
        await db.query(`CREATE SCHEMA IF NOT EXISTS "${schema2}"`);

        await db.query(`
            CREATE TABLE "${schema1}".table1 (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL
            );
        `);

        await db.query(`
            CREATE TABLE "${schema2}".table2 (
                id SERIAL PRIMARY KEY,
                description TEXT
            );
        `);

        vi.spyOn(prompts, "confirm").mockResolvedValue(true);

        // Run db-pull with multiple schemas
        await yargs()
            .options(globalOptions)
            .command(dbPull)
            .parseAsync(`pull --schema ${schema1} --schema ${schema2}`);

        // Check that both models were created
        const table1Model = fs.readFileSync(
            "/project/app/db.server/models/table1.ts",
            "utf8",
        ) as string;
        const table2Model = fs.readFileSync(
            "/project/app/db.server/models/table2.ts",
            "utf8",
        ) as string;

        expect(table1Model.trim()).toEqual(unindent`
            import { type ModelDefinition } from "@casekit/orm";

            export const table1 = {
                schema: "${schema1}",
                fields: {
                    id: { type: "serial", primaryKey: true },
                    name: { type: "text" },
                },
            } as const satisfies ModelDefinition;
        `);

        expect(table2Model.trim()).toEqual(unindent`
            import { type ModelDefinition } from "@casekit/orm";

            export const table2 = {
                schema: "${schema2}",
                fields: {
                    id: { type: "serial", primaryKey: true },
                    description: { type: "text", nullable: true },
                },
            } as const satisfies ModelDefinition;
        `);

        // Clean up
        await db.query(`DROP SCHEMA "${schema1}" CASCADE`);
        await db.query(`DROP SCHEMA "${schema2}" CASCADE`);
    });

    test("uses default schema from config when no schema specified", async () => {
        // Set up database schema
        await yargs().options(globalOptions).command(dbPush).parseAsync("push");

        await db.query(`
            CREATE TABLE "${schema}".product (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT NOT NULL,
                price NUMERIC(10,2)
            );
        `);

        vi.spyOn(prompts, "confirm").mockResolvedValue(true);

        // Run db-pull without specifying schema
        await yargs().options(globalOptions).command(dbPull).parseAsync("pull");

        // Check that product model was created
        const productModel = fs.readFileSync(
            "/project/app/db.server/models/product.ts",
            "utf8",
        ) as string;

        expect(productModel.trim()).toEqual(unindent`
            import { type ModelDefinition, sql } from "@casekit/orm";

            export const product = {
                schema: "${schema}",
                fields: {
                    id: { type: "uuid", primaryKey: true, default: sql\`gen_random_uuid()\` },
                    name: { type: "text" },
                    price: { type: "numeric", nullable: true },
                },
            } as const satisfies ModelDefinition;
        `);
    });

    test("overwrites existing files with --force flag", async () => {
        // Set up database schema
        await yargs().options(globalOptions).command(dbPush).parseAsync("push");

        // Create existing file with different content
        vol.fromJSON(
            {
                "app/db.server/models/user.ts": unindent`
                    // This is the old user model that should be overwritten
                    export const user = { old: true };
                `,
            },
            "/project",
        );

        // Run db-pull with --force
        await yargs()
            .options(globalOptions)
            .command(dbPull)
            .parseAsync(`pull --schema ${schema} --force`);

        // Check that user model was overwritten
        const userModel = fs.readFileSync(
            "/project/app/db.server/models/user.ts",
            "utf8",
        ) as string;

        // Verify it doesn't contain the old content
        expect(userModel).not.toContain("old: true");

        expect(userModel.trim()).toEqual(unindent`
            import { type ModelDefinition, sql } from "@casekit/orm";

            export const user = {
                schema: "${schema}",
                fields: {
                    id: { type: "uuid", primaryKey: true },
                    createdAt: { type: "timestamp without time zone", default: sql\`now()\` },
                    email: { type: "text", unique: true },
                    name: { type: "text", nullable: true },
                },
            } as const satisfies ModelDefinition;
        `);
    });

    test("handles tables with multi-column primary keys", async () => {
        const testSchema = `testschema_${randomUUID()}`;

        await db.query(`CREATE SCHEMA IF NOT EXISTS "${testSchema}"`);
        await db.query(`
            CREATE TABLE "${testSchema}".user_role (
                user_id UUID NOT NULL,
                role_id UUID NOT NULL,
                assigned_at TIMESTAMP DEFAULT now(),
                PRIMARY KEY (user_id, role_id)
            );
        `);

        vi.spyOn(prompts, "confirm").mockResolvedValue(true);

        await yargs()
            .options(globalOptions)
            .command(dbPull)
            .parseAsync(`pull --schema ${testSchema}`);

        const model = fs.readFileSync(
            "/project/app/db.server/models/userRole.ts",
            "utf8",
        ) as string;

        expect(model.trim()).toEqual(unindent`
            import { type ModelDefinition, sql } from "@casekit/orm";

            export const userRole = {
                schema: "${testSchema}",
                table: "user_role",
                fields: {
                    userId: { column: "user_id", type: "uuid" },
                    roleId: { column: "role_id", type: "uuid" },
                    assignedAt: {
                        column: "assigned_at",
                        type: "timestamp without time zone",
                        nullable: true,
                        default: sql\`now()\`,
                    },
                },
                primaryKey: ["userId", "roleId"],
            } as const satisfies ModelDefinition;
        `);

        await db.query(`DROP SCHEMA "${testSchema}" CASCADE`);
    });

    test("handles empty schema gracefully", async () => {
        const emptySchema = `emptyschema_${randomUUID()}`;
        await db.query(`CREATE SCHEMA IF NOT EXISTS "${emptySchema}"`);

        const result = await yargs()
            .options(globalOptions)
            .command(dbPull)
            .parseAsync(`pull --schema ${emptySchema}`);

        // Should complete without error
        expect(result).toBeDefined();

        await db.query(`DROP SCHEMA "${emptySchema}"`);
    });

    test("handles all supported data types (kitchen sink test)", async () => {
        const testSchema = `kitchensink_${randomUUID()}`;

        const modelFileContent = unindent`
            // This file will be overwritten by the pull command
            import { type ModelDefinition, sql } from "@casekit/orm";

            export const kitchenSink = {
                schema: "${testSchema}",
                fields: {
                    id: { type: "serial", primaryKey: true },
                    charField: { type: "character", default: "A" },
                    characterField: { type: "character", default: "B" },
                    characterNField: { type: "character", default: "Test Character" },
                    varcharField: {
                        type: "character varying",
                        default: sql\`'varchar test'::character varying\`,
                    },
                    varcharNField: {
                        type: "character varying",
                        default: sql\`'varchar24 test'::character varying\`,
                    },
                    textField: { type: "text", default: "This is a text field" },
                    bitField: { type: "bit", default: sql\`'1'::bit(1)\` },
                    bitNField: { type: "bit", default: sql\`'101'::bit(3)\` },
                    bitVaryingField: {
                        type: "bit varying",
                        default: sql\`'11010'::bit varying\`,
                    },
                    bitVaryingNField: {
                        type: "bit varying",
                        default: sql\`'110'::bit varying(3)\`,
                    },
                    numericField: { type: "numeric", default: 123.45 },
                    numericPrecisionField: { type: "numeric", default: 999.99 },
                    integerField: { type: "integer", default: 42 },
                    bigintField: { type: "bigint", default: "9223372036854775807" },
                    smallintField: { type: "smallint", default: 32767 },
                    serialField: { type: "serial" },
                    bigserialField: { type: "bigserial" },
                    smallserialField: { type: "smallserial" },
                    doublePrecisionField: {
                        type: "double precision",
                        default: 3.141592653589793,
                    },
                    realField: { type: "real", default: 2.71828 },
                    moneyField: { type: "money", default: sql\`'$1,234.56'::money\` },
                    booleanField: { type: "boolean", default: true },
                    uuidField: { type: "uuid", default: sql\`gen_random_uuid()\` },
                    dateField: { type: "date", default: sql\`CURRENT_DATE\` },
                    timeField: {
                        type: "time without time zone",
                        default: sql\`CURRENT_TIME\`,
                    },
                    timeWithPrecisionField: {
                        type: "time without time zone",
                        default: sql\`CURRENT_TIME\`,
                    },
                    timetzField: {
                        type: "time with time zone",
                        default: sql\`CURRENT_TIME\`,
                    },
                    timeWithTzField: {
                        type: "time with time zone",
                        default: sql\`CURRENT_TIME\`,
                    },
                    timestampField: {
                        type: "timestamp without time zone",
                        default: sql\`CURRENT_TIMESTAMP\`,
                    },
                    timestampWithPrecisionField: {
                        type: "timestamp without time zone",
                        default: sql\`CURRENT_TIMESTAMP\`,
                    },
                    timestamptzField: {
                        type: "timestamp with time zone",
                        default: sql\`CURRENT_TIMESTAMP\`,
                    },
                    timestampWithTzField: {
                        type: "timestamp with time zone",
                        default: sql\`CURRENT_TIMESTAMP\`,
                    },
                    jsonField: { type: "json", default: sql\`'{"key": "value"}'::json\` },
                    jsonbField: { type: "jsonb", default: sql\`'{"key": "value"}'::jsonb\` },
                    lineField: { type: "line", default: sql\`'{1,2,3}'::line\` },
                    lsegField: { type: "lseg", default: sql\`'[(0,0),(1,1)]'::lseg\` },
                    boxField: { type: "box", default: sql\`'(1,1),(0,0)'::box\` },
                    polygonField: {
                        type: "polygon",
                        default: sql\`'((0,0),(1,0),(1,1),(0,1))'::polygon\`,
                    },
                    cidrField: { type: "cidr", default: sql\`'192.168.1.0/24'::cidr\` },
                    inetField: { type: "inet", default: sql\`'192.168.1.1'::inet\` },
                    macaddrField: {
                        type: "macaddr",
                        default: sql\`'08:00:2b:01:02:03'::macaddr\`,
                    },
                    macaddr8Field: {
                        type: "macaddr8",
                        default: sql\`'08:00:2b:01:02:03:04:05'::macaddr8\`,
                    },
                    byteaField: { type: "bytea", default: sql\`'\\x41'::bytea\` },
                    xmlField: {
                        type: "xml",
                        default: sql\`'<root><element>value</element></root>'::xml\`,
                    },
                    pathField: { type: "path", default: sql\`'((0,0),(1,1),(2,0))'::path\` },
                    tsqueryField: {
                        type: "tsquery",
                        default: sql\`'''fat'' & ''rat'''::tsquery\`,
                    },
                    tsvectorField: {
                        type: "tsvector",
                        default: sql\`'''cat'':3 ''fat'':2,4 ''rat'':5A,6B'::tsvector\`,
                    },
                    int4RangeField: {
                        column: "int4rangeField",
                        type: "int4range",
                        default: sql\`'[1,10)'::int4range\`,
                    },
                    int8RangeField: {
                        column: "int8rangeField",
                        type: "int8range",
                        default: sql\`'[100,200)'::int8range\`,
                    },
                    numrangeField: {
                        type: "numrange",
                        default: sql\`'[1.1,2.2)'::numrange\`,
                    },
                    tsrangeField: {
                        type: "tsrange",
                        default: sql\`'["2023-01-01 00:00:00","2023-01-02 00:00:00")'::tsrange\`,
                    },
                    tstzrangeField: {
                        type: "tstzrange",
                        default: sql\`'["2023-01-01 00:00:00+00","2023-01-02 00:00:00+00")'::tstzrange\`,
                    },
                    daterangeField: {
                        type: "daterange",
                        default: sql\`'[2023-01-01,2023-01-02)'::daterange\`,
                    },
                    int2VectorField: {
                        column: "int2vectorField",
                        type: "int2vector",
                        default: sql\`'1 2 3'::int2vector\`,
                    },
                    oidField: { type: "oid", default: sql\`'12345'::oid\` },
                    pglsnField: { type: "pg_lsn", default: sql\`'16/B374D848'::pg_lsn\` },
                    regclassField: { type: "regclass", default: sql\`'pg_class'::regclass\` },
                    regnamespaceField: {
                        type: "regnamespace",
                        default: sql\`'public'::regnamespace\`,
                    },
                    regprocField: { type: "regproc", default: sql\`'now'::regproc\` },
                    regprocedureField: {
                        type: "regprocedure",
                        default: sql\`'abs(integer)'::regprocedure\`,
                    },
                    regroleField: {
                        type: "regrole",
                        default: sql\`(CURRENT_USER)::regrole\`,
                    },
                    regtypeField: { type: "regtype", default: sql\`'integer'::regtype\` },
                    tidField: { type: "tid", default: sql\`'(0,1)'::tid\` },
                    xidField: { type: "xid", default: sql\`'123'::xid\` },
                    txidSnapshotField: {
                        type: "txid_snapshot",
                        default: sql\`'10:20:10,14,15'::txid_snapshot\`,
                    },
                    arrayField: {
                        type: "text[]",
                        default: sql\`'{item1,item2,item3}'::text[]\`,
                    },
                    multiArrayField: {
                        type: "text[][][]",
                        default: sql\`ARRAY[ARRAY[ARRAY['a'::text, 'b'::text]], ARRAY[ARRAY['c'::text, 'd'::text]]]\`,
                    },
                },
            } as const satisfies ModelDefinition;
        `;

        vol.fromJSON(
            {
                "orm.config.ts": unindent`
                    import { orm } from "@casekit/orm";
                    import { kitchenSink } from "./app/db.server/models/kitchenSink.ts";
                    
                    export default {
                        db: orm({
                            schema: "${testSchema}",
                            models: { kitchenSink },
                        }),
                        directory: "./app/db.server",
                    };
                `,
                "app/db.server/models/kitchenSink.ts": modelFileContent,
            },
            "/project",
        );

        // Mock the specific config file path to return the memfs content
        vi.doMock("/project/orm.config.ts", () => {
            const kitchenSinkContent = fs.readFileSync(
                "/project/app/db.server/models/kitchenSink.ts",
                "utf8",
            ) as string;

            // Extract the kitchenSink object from the file content
            const kitchenSinkMatch =
                /export const kitchenSink = ({[\s\S]*}) as const satisfies ModelDefinition;/.exec(
                    kitchenSinkContent,
                );
            if (!kitchenSinkMatch) {
                throw new Error(
                    "Could not extract kitchenSink from model file",
                );
            }

            // doing this is really annoying but it's the only way i've figured out
            // to get the kitchenSink object into the config without having to redefine it,
            // as i haven't been able to figure out how to make `import` use files from the memfs
            // mocked filesystem.
            // eslint-disable-next-line @typescript-eslint/no-implied-eval
            const kitchenSink = new Function(
                "sql",
                "orm",
                `return ${kitchenSinkMatch[1]}`,
            )(sql, orm);

            return {
                default: {
                    db: orm({
                        schema: "${testSchema}",
                        models: { kitchenSink },
                    }),
                    directory: "./app/db.server",
                },
            };
        });

        await db.query(`CREATE SCHEMA IF NOT EXISTS "${testSchema}"`);

        // Import the mocked config
        const path = "/project/orm.config.ts";
        const { default: config } = await import(path);
        await config.db.connect();
        process.on("exit", async function () {
            await config.db.close();
        });
        vi.spyOn(loadConfig, "loadConfig").mockResolvedValue(config);

        // Push the kitchen sink model to the database
        await yargs()
            .options(globalOptions)
            .command(dbPush)
            .parseAsync(`push --schema ${testSchema}`);

        // Mock prompts to auto-confirm file writes
        vi.spyOn(prompts, "confirm").mockResolvedValue(true);

        // Pull the schema back
        await yargs()
            .options(globalOptions)
            .command(dbPull)
            .parseAsync(`pull --schema ${testSchema} --force`);

        // Read the generated model file
        const pulledModel = fs.readFileSync(
            "/project/app/db.server/models/kitchenSink.ts",
            { encoding: "utf8" },
        ) as string;

        // Verify the pulled model has actually been overwritten
        expect(pulledModel).not.toMatch(
            /This file will be overwritten by the pull command/,
        );

        expect(pulledModel.trim()).toEqual(
            modelFileContent
                .trim()
                .replace(
                    "// This file will be overwritten by the pull command\n",
                    "",
                ),
        );

        // Push the pulled model back to the database
        await db.query(`DROP SCHEMA "${testSchema}" CASCADE`);
        await db.query(`CREATE SCHEMA IF NOT EXISTS "${testSchema}"`);
        await yargs()
            .options(globalOptions)
            .command(dbPush)
            .parseAsync(`push --schema ${testSchema}`);

        // Verify the table was created successfully by querying it
        const result = await db.query(
            `SELECT column_name, data_type, column_default 
             FROM information_schema.columns 
             WHERE table_schema = $1 AND table_name = $2 
             ORDER BY ordinal_position`,
            [testSchema, "kitchenSink"],
        );

        expect(result.rows.length).toEqual(68);

        await db.query(`DROP SCHEMA "${testSchema}" CASCADE`);
    });

    test("handles foreign key relations (many-to-one and one-to-many)", async () => {
        const testSchema = `relations_${randomUUID()}`;

        await db.query(`CREATE SCHEMA IF NOT EXISTS "${testSchema}"`);

        // Create tables with foreign key relationships directly in the database
        await db.query(`
            CREATE TABLE "${testSchema}".user (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL
            );
        `);

        await db.query(`
            CREATE TABLE "${testSchema}".post (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                title TEXT NOT NULL,
                content TEXT,
                author_id UUID NOT NULL,
                created_at TIMESTAMP DEFAULT now(),
                CONSTRAINT post_author_id_fkey 
                    FOREIGN KEY (author_id) REFERENCES "${testSchema}".user(id)
            );
        `);

        vi.spyOn(prompts, "confirm").mockResolvedValue(true);

        // Run db-pull to generate model files
        await yargs()
            .options(globalOptions)
            .command(dbPull)
            .parseAsync(`pull --schema ${testSchema}`);

        // Check that both model files were created
        const userModel = fs.readFileSync(
            "/project/app/db.server/models/user.ts",
            "utf8",
        ) as string;
        const postModel = fs.readFileSync(
            "/project/app/db.server/models/post.ts",
            "utf8",
        ) as string;

        expect(userModel.trim()).toEqual(unindent`
            import { type ModelDefinition, sql } from "@casekit/orm";

            export const user = {
                schema: "${testSchema}",
                fields: {
                    id: { type: "uuid", primaryKey: true, default: sql\`gen_random_uuid()\` },
                    name: { type: "text" },
                    email: { type: "text", unique: true },
                },
                relations: {
                    authorPosts: {
                        type: "1:N",
                        model: "post",
                        fromField: "id",
                        toField: "authorId",
                    },
                },
            } as const satisfies ModelDefinition;
        `);

        expect(postModel.trim()).toEqual(unindent`
            import { type ModelDefinition, sql } from "@casekit/orm";

            export const post = {
                schema: "${testSchema}",
                fields: {
                    id: { type: "uuid", primaryKey: true, default: sql\`gen_random_uuid()\` },
                    title: { type: "text" },
                    content: { type: "text", nullable: true },
                    authorId: {
                        column: "author_id",
                        type: "uuid",
                        references: { model: "user", field: "id" },
                    },
                    createdAt: {
                        column: "created_at",
                        type: "timestamp without time zone",
                        nullable: true,
                        default: sql\`now()\`,
                    },
                },
                relations: {
                    author: {
                        type: "N:1",
                        model: "user",
                        fromField: "authorId",
                        toField: "id",
                    },
                },
            } as const satisfies ModelDefinition;
        `);

        await db.query(`DROP SCHEMA "${testSchema}" CASCADE`);
    });
});
