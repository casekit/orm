import pg from "pg";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import { normalizeConfig } from "@casekit/orm-config";
import { models } from "@casekit/orm-fixtures";
import { sql } from "@casekit/sql";

import { Connection, Transaction } from "../connection.js";
import { mockLogger } from "./util/logger.js";

describe("Connection", () => {
    describe("without connection pooling", () => {
        const logger = mockLogger();
        let connection: Connection;

        beforeEach(() => {
            logger.clear();
            connection = new Connection(
                normalizeConfig({
                    models: models,
                    pool: false,
                    logger: logger,
                }),
            );
        });

        afterEach(async () => {
            if (connection.open) {
                await connection.close();
            }
        });

        test("opening and closing the connection", async () => {
            await connection.connect();
            expect(connection.open).toBe(true);

            await connection.close();
            expect(connection.open).toBe(false);
        });

        test("warning on trying to connect twice", async () => {
            await connection.connect();
            await connection.connect();

            expect(logger.logs.warn[0]?.message).toEqual(
                "Tried to connect, but connection is already open",
            );
        });

        test("error on failing to connect", async () => {
            const connection = new Connection(
                normalizeConfig({
                    models: models,
                    connection: {
                        user: "nonexistent",
                        password: "nonexistent",
                        database: "nonexistent",
                        host: "nonexistent",
                        port: 54321,
                    },
                    pool: false,
                    logger,
                }),
            );

            await expect(connection.connect()).rejects.toThrowError();
            expect(logger.logs.error[0]?.message).toEqual(
                "Error connecting to database",
            );
        });

        test("warning on trying to close twice", async () => {
            await connection.connect();
            await connection.close();
            await connection.close();
            expect(logger.logs.warn[0]?.message).toEqual(
                "Tried to close connection, but it is already closed",
            );
        });

        test("running a query", async () => {
            await connection.connect();
            const result = await connection.query(sql`SELECT ${1}::int as num`);
            expect(result.rows[0]!["num"]).toBe(1);
        });

        test("error on trying to run query without connecting", async () => {
            await expect(
                connection.query(sql`SELECT ${1}::int as num`),
            ).rejects.toThrowError("Tried to run query but not connected");
        });
    });

    describe("with connection pooling", () => {
        const logger = mockLogger();
        let connection: Connection;

        beforeEach(() => {
            logger.clear();
            connection = new Connection(
                normalizeConfig({
                    models: models,
                    pool: true,
                    logger,
                }),
            );
        });

        afterEach(async () => {
            if (connection.open) {
                await connection.close();
            }
        });

        test("opening and closing the connection", async () => {
            await connection.connect();
            expect(connection.open).toBe(true);

            await connection.close();
            expect(connection.open).toBe(false);
        });

        test("warning on trying to connect twice", async () => {
            await connection.connect();
            await connection.connect();
            expect(logger.logs.warn[0]?.message).toEqual(
                "Tried to connect, but connection is already open",
            );
        });

        test("warning on trying to close twice", async () => {
            await connection.connect();
            await connection.close();
            await connection.close();
            expect(logger.logs.warn[0]?.message).toEqual(
                "Tried to close connection, but it is already closed",
            );
        });

        test("running a query", async () => {
            await connection.connect();
            const result = await connection.query(sql`SELECT ${1}::int as num`);
            expect(result.rows[0]!["num"]).toBe(1);
        });
    });
});

describe("Transaction", () => {
    describe("without connection pooling", () => {
        const logger = mockLogger();
        let connection: Connection;
        let transaction: Transaction;

        beforeEach(async () => {
            logger.clear();
            connection = new Connection(
                normalizeConfig({
                    models: models,
                    pool: false,
                    logger,
                }),
            );

            await connection.connect();
            await connection.query(
                sql`
                        CREATE TABLE IF NOT EXISTS transaction_test_table (id int);
                        TRUNCATE transaction_test_table
                    `,
            );
            transaction = await connection.startTransaction();
        });

        afterEach(async () => {
            await connection.query(
                sql`DROP TABLE IF EXISTS transaction_test_table`,
            );

            if (transaction.open) {
                await transaction.rollback();
            }
            if (connection.open) {
                await connection.close();
            }
        });

        test("trying to start a transaction before connecting", async () => {
            const connection = new Connection(
                normalizeConfig({
                    models: models,
                    pool: false,
                }),
            );

            await expect(() =>
                connection.startTransaction(),
            ).rejects.toThrowError(
                "Tried to start transaction but not connected",
            );
        });

        test("committing a transaction", async () => {
            await transaction.query(
                sql`INSERT INTO transaction_test_table VALUES (1)`,
            );
            await transaction.commit();

            const result = await connection.query(
                sql`SELECT * FROM transaction_test_table`,
            );

            expect(result.rows[0]!["id"]).toBe(1);
        });

        test("trying to connect while in a transaction", async () => {
            const tx = await connection.startTransaction();
            await expect(() => tx.connect()).rejects.toThrowError(
                "Cannot connect in transaction - already connected",
            );
        });

        test("trying to close while in a transaction", async () => {
            const tx = await connection.startTransaction();
            await expect(() => tx.close()).rejects.toThrowError(
                "Cannot close connection while in transaction",
            );
        });

        test("trying to open a nested transaction before transaction has been opened", async () => {
            const tx = new Transaction(
                normalizeConfig({
                    models: models,
                    pool: false,
                }),
                new pg.Client(),
            );

            await expect(tx.startTransaction()).rejects.toThrowError(
                "Tried to open nested transaction but parent transaction is closed",
            );
        });

        test("rolling back transaction", async () => {
            await transaction.query(
                sql`INSERT INTO transaction_test_table VALUES (1)`,
            );
            await transaction.rollback();

            const result = await connection.query(
                sql`SELECT * FROM transaction_test_table`,
            );

            expect(result.rows.length).toBe(0);
        });

        test("error on trying to commit twice", async () => {
            await transaction.commit();
            await expect(transaction.commit()).rejects.toThrowError(
                "Tried to commit transaction but it is closed",
            );
        });

        test("commiting a nested transaction then rolling back the parent transaction", async () => {
            const nestedTx = await transaction.startTransaction();
            await nestedTx.query(
                sql`INSERT INTO transaction_test_table VALUES (1)`,
            );
            await nestedTx.commit();

            const innerResult = await transaction.query(
                sql`SELECT * FROM transaction_test_table`,
            );
            expect(innerResult.rows[0]!["id"]).toBe(1);

            await transaction.rollback();

            const outerResult = await connection.query(
                sql`SELECT * FROM transaction_test_table`,
            );

            expect(outerResult.rows.length).toBe(0);
        });

        test("commiting a nested transaction then committing the parent transaction", async () => {
            const nestedTx = await transaction.startTransaction();
            await nestedTx.query(
                sql`INSERT INTO transaction_test_table VALUES (1)`,
            );
            await nestedTx.commit();

            const innerResult = await transaction.query(
                sql`SELECT * FROM transaction_test_table`,
            );
            expect(innerResult.rows[0]!["id"]).toBe(1);

            await transaction.commit();

            const outerResult = await connection.query(
                sql`SELECT * FROM transaction_test_table`,
            );

            expect(outerResult.rows[0]!["id"]).toBe(1);
        });

        test("rolling back the nested transaction but committing the parent transaction", async () => {
            const nestedTx = await transaction.startTransaction();
            await nestedTx.query(
                sql`INSERT INTO transaction_test_table VALUES (1)`,
            );
            await nestedTx.rollback();

            const innerResult = await transaction.query(
                sql`SELECT * FROM transaction_test_table`,
            );
            expect(innerResult.rows.length).toBe(0);

            await transaction.commit();

            const outerResult = await connection.query(
                sql`SELECT * FROM transaction_test_table`,
            );

            expect(outerResult.rows.length).toBe(0);
        });

        test("rolling back on error", async () => {
            await transaction.query(
                sql`INSERT INTO transaction_test_table VALUES (2)`,
            );
            await expect(
                transaction.query(sql`SELECT * FROM non_existent_table`),
            ).rejects.toThrowError(
                'relation "non_existent_table" does not exist',
            );
            expect(logger.logs.error[0]?.message).toContain(
                "Error running query",
            );
            expect(logger.logs.error[1]?.message).toEqual(
                "Rolling back transaction due to error",
            );
            const result = await connection.query(
                sql`SELECT * FROM transaction_test_table`,
            );
            expect(result.rows.length).toBe(0);
        });
    });

    describe("with connection pooling", () => {
        const logger = mockLogger();
        let connection: Connection;
        let transaction: Transaction;

        beforeEach(async () => {
            logger.clear();
            connection = new Connection(
                normalizeConfig({
                    models: models,
                    pool: true,
                    logger,
                }),
            );

            await connection.connect();
            await connection.query(
                sql`
                        CREATE TABLE IF NOT EXISTS transaction_test_table (id int);
                        TRUNCATE transaction_test_table
                    `,
            );
            transaction = await connection.startTransaction();
        });

        afterEach(async () => {
            if (transaction.open) {
                await transaction.rollback();
            }
            if (connection.open) {
                await connection.query(
                    sql`DROP TABLE IF EXISTS transaction_test_table`,
                );
                await connection.close();
            }
        });

        test("committing a transaction", async () => {
            await transaction.query(
                sql`INSERT INTO transaction_test_table VALUES (1)`,
            );
            await transaction.commit();

            const result = await connection.query(
                sql`SELECT * FROM transaction_test_table`,
            );

            expect(result.rows[0]!["id"]).toBe(1);
        });

        test("rolling back transaction", async () => {
            await transaction.query(
                sql`INSERT INTO transaction_test_table VALUES (1)`,
            );
            await transaction.rollback();

            const result = await connection.query(
                sql`SELECT * FROM transaction_test_table`,
            );

            expect(result.rows.length).toBe(0);
        });

        test("error on trying to commit twice", async () => {
            await transaction.commit();
            await expect(transaction.commit()).rejects.toThrowError(
                "Tried to commit transaction but it is closed",
            );
        });

        test("commiting a nested transaction then rolling back the parent transaction", async () => {
            const nestedTx = await transaction.startTransaction();
            await nestedTx.query(
                sql`INSERT INTO transaction_test_table VALUES (1)`,
            );
            await nestedTx.commit();

            const innerResult = await transaction.query(
                sql`SELECT * FROM transaction_test_table`,
            );
            expect(innerResult.rows[0]!["id"]).toBe(1);

            await transaction.rollback();

            const outerResult = await connection.query(
                sql`SELECT * FROM transaction_test_table`,
            );

            expect(outerResult.rows.length).toBe(0);
        });

        test("commiting a nested transaction then committing the parent transaction", async () => {
            const nestedTx = await transaction.startTransaction();
            await nestedTx.query(
                sql`INSERT INTO transaction_test_table VALUES (1)`,
            );
            await nestedTx.commit();

            const innerResult = await transaction.query(
                sql`SELECT * FROM transaction_test_table`,
            );
            expect(innerResult.rows[0]!["id"]).toBe(1);

            await transaction.commit();

            const outerResult = await connection.query(
                sql`SELECT * FROM transaction_test_table`,
            );

            expect(outerResult.rows[0]!["id"]).toBe(1);
        });

        test("rolling back the nested transaction but committing the parent transaction", async () => {
            const nestedTx = await transaction.startTransaction();
            await nestedTx.query(
                sql`INSERT INTO transaction_test_table VALUES (1)`,
            );
            await nestedTx.rollback();

            const innerResult = await transaction.query(
                sql`SELECT * FROM transaction_test_table`,
            );
            expect(innerResult.rows.length).toBe(0);

            await transaction.commit();

            const outerResult = await connection.query(
                sql`SELECT * FROM transaction_test_table`,
            );

            expect(outerResult.rows.length).toBe(0);
        });

        test("rolling back on error", async () => {
            await transaction.query(
                sql`INSERT INTO transaction_test_table VALUES (2)`,
            );
            await expect(
                transaction.query(sql`SELECT * FROM non_existent_table`),
            ).rejects.toThrowError(
                'relation "non_existent_table" does not exist',
            );
            expect(logger.logs.error[0]?.message).toContain(
                "Error running query",
            );
            const result = await connection.query(
                sql`SELECT * FROM transaction_test_table`,
            );
            expect(result.rows.length).toBe(0);
        });

        test("rolling back nested transaction on error", async () => {
            const nestedTx = await transaction.startTransaction();
            await nestedTx.query(
                sql`INSERT INTO transaction_test_table VALUES (2)`,
            );
            await expect(
                nestedTx.query(sql`SELECT * FROM non_existent_table`),
            ).rejects.toThrowError(
                'relation "non_existent_table" does not exist',
            );

            expect(logger.logs.error[0]?.message).toContain(
                "Error running query",
            );
            expect(logger.logs.error[1]?.message).toEqual(
                "Rolling back transaction due to error",
            );

            await transaction.query(
                sql`INSERT INTO transaction_test_table VALUES (7)`,
            );
            const result = await transaction.query(
                sql`SELECT * FROM transaction_test_table`,
            );
            expect(result.rows.length).toBe(1);
            expect(result.rows[0]!["id"]).toBe(7);
        });
    });
});
