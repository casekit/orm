import { Client } from "pg";

export const withTransaction = async <T>(
    cb: (client: Client) => Promise<T>,
): Promise<T> => {
    const client = new Client();
    try {
        await client.connect();
        await client.query("BEGIN");
        const result = await cb(client);
        await client.query("COMMIT");
        return result;
    } catch (e) {
        await client.query("ROLLBACK");
        throw e;
    } finally {
        await client.end();
    }
};
