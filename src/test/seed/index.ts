import { keyBy, times, uniq } from "lodash-es";

import { DB } from "../db";

export type SeedParams = {
    users: {
        username: string;
        tenants: {
            name: string;
            posts: number;
        }[];
    }[];
};

export const seed = async (
    db: DB,
    params: SeedParams,
): Promise<{
    users: Record<string, { id: string; username: string }>;
    tenants: Record<string, { id: string; name: string }>;
    tenantUsers: { userId: string; tenantId: string }[];
    posts: { id: string; title: string; content: string; authorId: string }[];
}> => {
    const tenants = keyBy(
        await Promise.all(
            uniq(params.users.flatMap((u) => u.tenants)).map((tenant) =>
                db.createOne("tenant", {
                    data: { name: tenant.name },
                    returning: ["id", "name", "createdAt"],
                }),
            ),
        ),
        "name",
    );

    const users = keyBy(
        await Promise.all(
            uniq(
                params.users.map((user) =>
                    db.createOne("user", {
                        data: { username: user.username },
                        returning: ["id", "username"],
                    }),
                ),
            ),
        ),
        "username",
    );

    const tenantUsers = await Promise.all(
        params.users.flatMap((user) => {
            return user.tenants.map((tenant) => {
                return db.createOne("tenantUser", {
                    data: {
                        userId: users[user.username].id,
                        tenantId: tenants[tenant.name].id,
                    },
                    returning: ["id", "userId", "tenantId"],
                });
            });
        }),
    );

    let postIndex = 0;
    const posts = await Promise.all(
        params.users.flatMap((user) =>
            user.tenants.flatMap((tenant) =>
                times(tenant.posts, () => {
                    const letter = String.fromCharCode(
                        "a".charCodeAt(0) + postIndex++,
                    );
                    return db.createOne("post", {
                        data: {
                            title: `Post ${letter}`,
                            content: `This is the content of post ${letter}`,
                            authorId: users[user.username].id,
                            tenantId: tenants[tenant.name].id,
                        },
                        returning: ["id", "title", "content", "authorId"],
                    });
                }),
            ),
        ),
    );

    return { users, tenants, tenantUsers, posts };
};
