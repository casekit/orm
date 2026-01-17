import pg, { QueryResultRow } from "pg";
import * as uuid from "uuid";

import { NormalizedConfig } from "@casekit/orm-config";
import { SQLStatement, sql } from "@casekit/sql";

export class Connection {
    protected readonly config: NormalizedConfig;
    protected client: pg.Client | null = null;
    protected pool: pg.Pool | null = null;
    protected poolClient: pg.PoolClient | null = null;

    protected _open = false;
    public get open() {
        return this._open;
    }

    constructor(config: NormalizedConfig) {
        this.config = config;
    }

    public async connect(): Promise<void> {
        if (this.open) {
            this.config.logger.warn(
                "Tried to connect, but connection is already open",
            );
            return;
        }
        try {
            if (this.config.pool) {
                this.pool = new pg.Pool(this.config.connection ?? undefined);
            } else {
                this.client = new pg.Client(
                    this.config.connection ?? undefined,
                );
                await this.client.connect();
            }
            this._open = true;
        } catch (e) {
            this.config.logger.error("Error connecting to database", e);
            await this.close();
            throw e;
        }
    }

    public async close() {
        if (!this.open) {
            this.config.logger.warn(
                "Tried to close connection, but it is already closed",
            );
            return;
        }
        try {
            if (this.client) {
                await this.client.end();
            }
            if (this.pool) {
                await this.pool.end();
            }
            /* v8 ignore next 3 */
        } catch (e) {
            this.config.logger.error("Error closing client", e);
            throw e;
        } finally {
            this._open = false;
        }
    }

    public async query<T extends QueryResultRow>(sql: SQLStatement) {
        try {
            if (!this.open) {
                throw new Error("Tried to run query but not connected");
            } else if (this.poolClient) {
                return await this.poolClient.query<T>(sql);
            } else if (this.pool) {
                return await this.pool.query<T>(sql);
            } else if (this.client) {
                return await this.client.query<T>(sql);
                /* v8 ignore next 3 */
            } else {
                throw new Error("Tried to run query but not connected");
            }
        } catch (e) {
            this.config.logger.error(`Error running query: ${sql.pretty}`);
            throw e;
        }
    }

    public async startTransaction(): Promise<Transaction> {
        if (!this.open) {
            /* v8 ignore next */
            throw new Error("Tried to start transaction but not connected");
        }
        const tx = new Transaction(
            this.config,
            this.client,
            this.pool,
            this.pool ? await this.pool.connect() : null,
            false,
        );
        await tx.begin();
        return tx;
    }

    public isTransaction() {
        return false;
    }
}

export class Transaction extends Connection {
    private readonly conn: pg.Client | pg.PoolClient;
    private readonly savepoint: string;
    private readonly nested: boolean;

    constructor(
        config: NormalizedConfig,
        client: pg.Client | null = null,
        pool: pg.Pool | null = null,
        poolClient: pg.PoolClient | null = null,
        nested = false,
    ) {
        /* v8 ignore next 3 */
        if (!client && !poolClient) {
            throw new Error("Tried to start transaction but not connected");
        }
        super(config);
        this.conn = (poolClient ?? client)!;
        this.client = client;
        this.pool = pool;
        this.poolClient = poolClient;
        this.nested = nested;
        this.savepoint = uuid.v4();
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    override async connect() {
        throw new Error("Cannot connect in transaction - already connected");
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    override async close() {
        throw new Error("Cannot close connection while in transaction");
    }

    override async query<T extends QueryResultRow>(sql: SQLStatement) {
        /* v8 ignore start */
        if (!this.open) {
            throw new Error(
                "Tried to run query but transaction is already closed",
            );
        }
        /* v8 ignore stop */
        try {
            return await super.query<T>(sql);
        } catch (e) {
            this.config.logger.error(
                "Rolling back transaction due to error",
                e,
            );
            await this.rollback();
            throw e;
        }
    }

    override async startTransaction() {
        if (!this.open) {
            throw new Error(
                "Tried to open nested transaction but parent transaction is closed",
            );
        }
        const tx = new Transaction(
            this.config,
            this.client,
            this.pool,
            this.poolClient,
            true,
        );
        await tx.begin();
        return tx;
    }

    public async begin() {
        try {
            await this.conn.query(
                this.nested
                    ? sql`SAVEPOINT ${sql.ident(this.savepoint)}`
                    : sql`BEGIN`,
            );
            this._open = true;
            /* v8 ignore start */
        } catch (e) {
            this.config.logger.error("Error starting transaction", e);
            await this.rollback();
            throw e;
        }
        /* v8 ignore stop */
    }

    public async rollback() {
        if (!this.open) return;
        try {
            await this.conn.query(
                this.nested
                    ? sql`ROLLBACK TO SAVEPOINT ${sql.ident(this.savepoint)}`
                    : sql`ROLLBACK`,
            );
            /* v8 ignore start */
        } catch (e) {
            this.config.logger.error("Error rolling back transaction", e);
            throw e;
            /* v8 ignore stop */
        } finally {
            this._open = false;
            if (this.poolClient && !this.nested) {
                this.poolClient.release();
            }
        }
    }

    public async commit() {
        if (!this.open) {
            throw new Error("Tried to commit transaction but it is closed");
        }
        try {
            await this.conn.query(
                this.nested
                    ? sql`RELEASE SAVEPOINT ${sql.ident(this.savepoint)}`
                    : sql`COMMIT`,
            );
            /* v8 ignore start */
        } catch (e) {
            this.config.logger.error("Error committing transaction", e);
            await this.rollback();
            throw e;
            /* v8 ignore stop */
        } finally {
            this._open = false;
            if (this.poolClient && !this.nested) {
                this.poolClient.release();
            }
        }
    }
    public override isTransaction() {
        return true;
    }
}
