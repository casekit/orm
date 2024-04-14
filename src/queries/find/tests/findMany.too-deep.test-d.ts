import { assertType, describe, test } from "vitest";

import { db } from "../../../test/db";
import { $gt } from "../../clauses/where/operators";

describe("findMany", () => {
    test("deeply nested clauses don't cause type errors", async () => {
        assertType(
            await db.findMany("user", {
                select: ["username"],
                include: {
                    tenants: {
                        select: ["name"],
                        orderBy: ["name"],
                        include: {
                            tenancies: {
                                select: ["id"],
                                where: { createdAt: { [$gt]: new Date() } },
                            },
                            users: {
                                select: ["username", "id"],
                                where: {
                                    id: "abc",
                                    deletedAt: { [$gt]: new Date() },
                                },
                                orderBy: ["joinedAt"],
                            },
                        },
                    },
                },
            }),
        );
    });
});
