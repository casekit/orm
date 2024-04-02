import { orm } from "../..";
import { config } from "./config";
import * as models from "./models";

export const db = orm({ config, models, extensions: ["uuid-ossp"] });
export { config, models };

export const f = async () => {
    const x = await db.create("post", {
        data: { title: "Hello, world!", content: "hello", authorId: "222" },
        returning: ["id"],
    });
    return x;
};
