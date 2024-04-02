import { v4 as uuid } from "uuid";

import { orm } from "../..";
import { CreateParams } from "../../types/queries/CreateParams";
import { config } from "./config";
import * as models from "./models";

export const db = orm({ config, models, extensions: ["uuid-ossp"] });
export { config, models };

export const x = await db.create("post", {
    data: {
        id: "1",
        title: "Hello, World!",
        content: "This is a test post.",
        authorId: uuid(),
        x: 2,
    },
    returning: ["id"],
});

export const y = await db.create("post", {
    data: {
        id: "1",
        title: "Hello, World!",
        content: "This is a test post.",
        authorId: uuid(),
        x: 2,
    },
    returning: ["id"],
} satisfies CreateParams<typeof models, "post">);
