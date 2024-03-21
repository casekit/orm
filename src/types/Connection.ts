import { Client, Pool, PoolClient } from "pg";

export type Connection = Pool | PoolClient | Client;
