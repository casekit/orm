import pg from "pg";

export type Config = {
    naming: {
        column: (s: string) => string;
        table: (s: string) => string;
    };
    schema: string;
    connection?: pg.PoolConfig;
};
