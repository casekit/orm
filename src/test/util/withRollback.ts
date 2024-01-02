import { Client } from "pg";

export const withRollback = async <T>(
    cb: (client: Client) => Promise<T>,
): Promise<T> => {
    const client = new Client();
    try {
        await client.connect();
        await client.query("BEGIN");
        return await cb(client);
    } finally {
        try {
            await client.query("ROLLBACK");
        } finally {
            await client.end();
        }
    }
};
