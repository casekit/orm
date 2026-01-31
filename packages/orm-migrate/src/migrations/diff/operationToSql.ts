import { SQLStatement, sql } from "@casekit/sql";

import type { ColumnSnapshot, TableSnapshot } from "../types.js";
import type { ColumnChanges, SchemaDiffOperation } from "./types.js";

/**
 * Convert a list of diff operations into SQL statements.
 * Returns an array of SQL strings ready to be written to a migration file.
 */
export const operationsToSql = (ops: SchemaDiffOperation[]): string[] => {
    return ops.map((op) => operationToSql(op).text.trim());
};

/**
 * Convert a single diff operation into a SQLStatement.
 */
export const operationToSql = (op: SchemaDiffOperation): SQLStatement => {
    switch (op.type) {
        case "createSchema":
            return sql`CREATE SCHEMA IF NOT EXISTS ${sql.ident(op.schema)};`;

        case "dropSchema":
            return sql`DROP SCHEMA IF EXISTS ${sql.ident(op.schema)};`;

        case "createExtension":
            return sql`CREATE EXTENSION IF NOT EXISTS ${sql.ident(op.name)} SCHEMA ${sql.ident(op.schema)};`;

        case "dropExtension":
            return sql`DROP EXTENSION IF EXISTS ${sql.ident(op.name)};`;

        case "createTable":
            return createTableSql(op.table);

        case "dropTable":
            return sql`DROP TABLE IF EXISTS ${sql.ident(op.schema)}.${sql.ident(op.table)};`;

        case "addColumn":
            return addColumnSql(op.schema, op.table, op.column);

        case "dropColumn":
            return sql`ALTER TABLE ${sql.ident(op.schema)}.${sql.ident(op.table)} DROP COLUMN ${sql.ident(op.column)};`;

        case "renameColumn":
            return sql`ALTER TABLE ${sql.ident(op.schema)}.${sql.ident(op.table)} RENAME COLUMN ${sql.ident(op.oldName)} TO ${sql.ident(op.newName)};`;

        case "alterColumn":
            return alterColumnSql(op.schema, op.table, op.column, op.changes);

        case "addForeignKey":
            return addForeignKeySql(op.schema, op.table, op.foreignKey);

        case "dropForeignKey":
            return sql`ALTER TABLE ${sql.ident(op.schema)}.${sql.ident(op.table)} DROP CONSTRAINT ${sql.ident(op.constraintName)};`;

        case "addUniqueConstraint":
            return addUniqueConstraintSql(op.schema, op.table, op.constraint);

        case "dropUniqueConstraint":
            return sql`DROP INDEX IF EXISTS ${sql.ident(op.schema)}.${sql.ident(op.constraintName)};`;

        case "renameForeignKey":
            return sql`ALTER TABLE ${sql.ident(op.schema)}.${sql.ident(op.table)} RENAME CONSTRAINT ${sql.ident(op.oldName)} TO ${sql.ident(op.newName)};`;

        case "renameUniqueConstraint":
            return sql`ALTER INDEX ${sql.ident(op.schema)}.${sql.ident(op.oldName)} RENAME TO ${sql.ident(op.newName)};`;

        case "alterPrimaryKey":
            return alterPrimaryKeySql(op);
    }
};

const createTableSql = (table: TableSnapshot): SQLStatement => {
    const statement = sql`CREATE TABLE ${sql.ident(table.schema)}.${sql.ident(table.name)} (\n`;

    table.columns.forEach((col, i) => {
        statement.append`  ${sql.ident(col.name)} `;
        statement.push(new SQLStatement(col.type));

        if (!col.nullable) statement.append` NOT NULL`;

        if (col.default !== null) {
            statement.append` DEFAULT `;
            statement.push(new SQLStatement(col.default));
        }

        if (i < table.columns.length - 1) statement.append`,\n`;
    });

    if (table.primaryKey.columns.length > 0) {
        statement.append`,\n  PRIMARY KEY (${sql.join(
            table.primaryKey.columns.map(sql.ident),
            ", ",
        )})`;
    }

    statement.append`\n);`;
    return statement;
};

const addColumnSql = (
    schema: string,
    table: string,
    column: ColumnSnapshot,
): SQLStatement => {
    const statement = sql`ALTER TABLE ${sql.ident(schema)}.${sql.ident(table)} ADD COLUMN ${sql.ident(column.name)} `;
    statement.push(new SQLStatement(column.type));

    if (!column.nullable) statement.append` NOT NULL`;

    if (column.default !== null) {
        statement.append` DEFAULT `;
        statement.push(new SQLStatement(column.default));
    }

    statement.append`;`;
    return statement;
};

const alterColumnSql = (
    schema: string,
    table: string,
    column: string,
    changes: ColumnChanges,
): SQLStatement => {
    const statements: SQLStatement[] = [];

    if (changes.type) {
        statements.push(
            sql`ALTER TABLE ${sql.ident(schema)}.${sql.ident(table)} ALTER COLUMN ${sql.ident(column)} TYPE ${new SQLStatement(changes.type.to)};`,
        );
    }

    if (changes.nullable) {
        if (changes.nullable.to) {
            statements.push(
                sql`ALTER TABLE ${sql.ident(schema)}.${sql.ident(table)} ALTER COLUMN ${sql.ident(column)} DROP NOT NULL;`,
            );
        } else {
            statements.push(
                sql`ALTER TABLE ${sql.ident(schema)}.${sql.ident(table)} ALTER COLUMN ${sql.ident(column)} SET NOT NULL;`,
            );
        }
    }

    if (changes.default) {
        if (changes.default.to === null) {
            statements.push(
                sql`ALTER TABLE ${sql.ident(schema)}.${sql.ident(table)} ALTER COLUMN ${sql.ident(column)} DROP DEFAULT;`,
            );
        } else {
            const stmt = sql`ALTER TABLE ${sql.ident(schema)}.${sql.ident(table)} ALTER COLUMN ${sql.ident(column)} SET DEFAULT `;
            stmt.push(new SQLStatement(changes.default.to));
            stmt.append`;`;
            statements.push(stmt);
        }
    }

    return sql.join(statements, "\n");
};

const addForeignKeySql = (
    schema: string,
    table: string,
    fk: import("../types.js").ForeignKeySnapshot,
): SQLStatement => {
    const statement = sql`ALTER TABLE ${sql.ident(schema)}.${sql.ident(table)} ADD CONSTRAINT ${sql.ident(fk.name)} FOREIGN KEY (${sql.join(fk.columns.map(sql.ident), ", ")}) REFERENCES ${sql.ident(fk.referencesSchema)}.${sql.ident(fk.referencesTable)} (${sql.join(fk.referencesColumns.map(sql.ident), ", ")})`;

    if (fk.onDelete) {
        statement.append` ON DELETE `;
        statement.push(new SQLStatement(fk.onDelete));
    }

    if (fk.onUpdate) {
        statement.append` ON UPDATE `;
        statement.push(new SQLStatement(fk.onUpdate));
    }

    statement.append`;`;
    return statement;
};

const addUniqueConstraintSql = (
    schema: string,
    table: string,
    constraint: import("../types.js").UniqueConstraintSnapshot,
): SQLStatement => {
    const statement = sql`CREATE UNIQUE INDEX ${sql.ident(constraint.name)} ON ${sql.ident(schema)}.${sql.ident(table)} (${sql.join(constraint.columns.map(sql.ident), ", ")})`;

    if (constraint.nullsNotDistinct) {
        statement.append` NULLS NOT DISTINCT`;
    }

    if (constraint.where) {
        statement.append` WHERE (`;
        statement.push(new SQLStatement(constraint.where));
        statement.append`)`;
    }

    statement.append`;`;
    return statement;
};

const alterPrimaryKeySql = (op: {
    schema: string;
    table: string;
    oldConstraintName: string | null;
    oldColumns: string[];
    newColumns: string[];
}): SQLStatement => {
    const statements: SQLStatement[] = [];

    if (op.oldColumns.length > 0 && op.oldConstraintName) {
        statements.push(
            sql`ALTER TABLE ${sql.ident(op.schema)}.${sql.ident(op.table)} DROP CONSTRAINT IF EXISTS ${sql.ident(op.oldConstraintName)};`,
        );
    }

    if (op.newColumns.length > 0) {
        statements.push(
            sql`ALTER TABLE ${sql.ident(op.schema)}.${sql.ident(op.table)} ADD PRIMARY KEY (${sql.join(op.newColumns.map(sql.ident), ", ")});`,
        );
    }

    return sql.join(statements, "\n");
};
