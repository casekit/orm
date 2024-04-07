import pg from "pg";

export type Config = {
    schema: string;
    connection?: pg.PoolConfig;
};
