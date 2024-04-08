import * as uuid from "uuid";

import { DB } from "../db";

export const seed = async (db: DB) => {
    const userId = uuid.v4();
    const tenantId = uuid.v4();
    const postId1 = uuid.v4();
    const postId2 = uuid.v4();

    const tenant = await db.create("tenant", {
        data: {
            id: tenantId,
            name: "popovapark",
        },
        returning: ["id", "name", "createdAt"],
    });

    const user = await db.create("user", {
        data: {
            id: userId,
            username: "rosoll",
        },
        returning: ["id", "username", "joinedAt", "deletedAt"],
    });

    const post1 = await db.create("post", {
        data: {
            id: postId1,
            authorId: userId,
            tenantId: tenantId,
            title: "hello it me",
            content: "i'm writing a post",
        },
        returning: [
            "id",
            "title",
            "content",
            "publishedAt",
            "authorId",
            "tenantId",
            "tags",
        ],
    });

    const post2 = await db.create("post", {
        data: {
            id: postId2,
            authorId: userId,
            tenantId: tenantId,
            title: "i like cats",
            content: "i really like cats",
        },
        returning: [
            "id",
            "title",
            "content",
            "publishedAt",
            "authorId",
            "tenantId",
            "tags",
        ],
    });

    return { tenant, user, posts: [post1, post2] };
};
