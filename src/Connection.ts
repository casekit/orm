import pg, { QueryResultRow } from "pg";
import pgfmt from "pg-format";
import * as uuid from "uuid";

import { SQLStatement } from "./sql";

export class Connection {
    constructor(
        private pool: pg.Pool,
        private client?: pg.PoolClient,
    ) {}

    public query = async <T extends QueryResultRow>(query: SQLStatement) => {
        if (this.client) {
            return this.client.query<T>(query);
        } else {
            return this.pool.query(query);
        }
    };

    public transact = async <T>(
        fn: (conn: Connection) => Promise<T>,
        { rollback = false }: { rollback?: boolean } = {},
    ) => {
        if (this.client) {
            const savepoint = uuid.v4();
            try {
                await this.client.query(pgfmt("SAVEPOINT %I", savepoint));
                const result = await fn(this);
                if (rollback) {
                    await this.client.query(
                        pgfmt("ROLLBACK TO SAVEPOINT %I", savepoint),
                    );
                } else {
                    await this.client.query(
                        pgfmt("RELEASE SAVEPOINT %I", savepoint),
                    );
                }
                return result;
            } catch (e) {
                await this.client.query(
                    pgfmt("ROLLBACK TO SAVEPOINT %I", savepoint),
                );
                throw e;
            }
        } else {
            const client = await this.pool.connect();
            try {
                await client.query("BEGIN");
                const result = await fn(new Connection(this.pool, client));
                if (rollback) {
                    await client.query("ROLLBACK");
                } else {
                    await client.query("COMMIT");
                }
                return result;
            } catch (e) {
                await client.query("ROLLBACK");
                throw e;
            } finally {
                client.release();
            }
        }
    };
}
