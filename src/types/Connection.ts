import pg from "pg";

export type Connection = pg.Pool | pg.PoolClient | pg.Client;
