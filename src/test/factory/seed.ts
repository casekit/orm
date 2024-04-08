import * as uuid from "uuid";

import { DB } from "../db";

export const seed = async (db: DB) => {
    const userId = uuid.v4();
    const tenantId1 = uuid.v4();
    const tenantId2 = uuid.v4();
    const postId1 = uuid.v4();
    const postId2 = uuid.v4();

    const tenant1 = await db.create("tenant", {
        data: {
            id: tenantId1,
            name: "popovapark",
        },
        returning: ["id", "name", "createdAt"],
    });

    const tenant2 = await db.create("tenant", {
        data: {
            id: tenantId2,
            name: "WFMA",
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

    await db.create("tenantUser", {
        data: {
            tenantId: tenantId1,
            userId: userId,
        },
    });

    await db.create("tenantUser", {
        data: {
            tenantId: tenantId2,
            userId: userId,
        },
    });

    const post1 = await db.create("post", {
        data: {
            id: postId1,
            authorId: userId,
            tenantId: tenantId1,
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
            tenantId: tenantId1,
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

    return { tenants: [tenant1, tenant2], user, posts: [post1, post2] };
};
