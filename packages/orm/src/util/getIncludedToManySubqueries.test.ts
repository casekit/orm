import { identity } from "es-toolkit";
import { describe, expect, test } from "vitest";

import { createTestDB } from "../tests/util/db.js";
import { getIncludedToManySubqueries } from "./getIncludedToManySubqueries.js";

describe("getIncludedToManySubqueries", () => {
    const { db } = createTestDB();

    test("returns empty array when no includes specified", () => {
        const result = getIncludedToManySubqueries(db.config, "user", {
            select: ["id", "name"],
        });
        expect(result).toEqual([]);
    });

    test("processes 1:N relations correctly", () => {
        const result = getIncludedToManySubqueries(db.config, "user", {
            select: ["id", "name"],
            include: {
                posts: {
                    select: ["id", "title"],
                    where: { deletedAt: null },
                },
            },
        });

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
            modelName: "post",
            from: ["id"],
            to: ["authorId"],
            path: ["posts"],
            query: {
                select: ["id", "title"],
                where: { deletedAt: null },
            },
        });
        expect(result[0]!.extract).toBe(identity);
    });

    test("processes N:N relations correctly", () => {
        const result = getIncludedToManySubqueries(db.config, "user", {
            select: ["id", "name"],
            include: {
                friends: {
                    select: ["id", "name"],
                },
            },
        });

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
            modelName: "friendship",
            from: ["id"],
            to: ["userId"],
            path: ["friends"],
            query: {
                select: ["userId", "friendId"],
                include: {
                    friend: {
                        select: ["id", "name"],
                    },
                },
            },
        });

        const mockRows = [
            { friend: { id: 1, name: "Friend 1" } },
            { friend: { id: 2, name: "Friend 2" } },
        ];
        expect(result[0]!.extract(mockRows)).toEqual([
            { id: 1, name: "Friend 1" },
            { id: 2, name: "Friend 2" },
        ]);
    });

    test("processes nested N:1 relations with to-many relations correctly", () => {
        const result = getIncludedToManySubqueries(db.config, "like", {
            select: ["id", "userId"],
            include: {
                post: {
                    select: ["id"],
                    include: {
                        likes: {
                            select: ["id", "userId"],
                        },
                    },
                },
            },
        });

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
            modelName: "like",
            path: ["post", "likes"],
            query: {
                select: ["id", "userId"],
            },
        });
    });

    test("handles multiple to-many relations at the same level", () => {
        const result = getIncludedToManySubqueries(db.config, "post", {
            select: ["id", "title"],
            include: {
                likes: {
                    select: ["id", "userId"],
                },
                author: {
                    select: ["id"],
                    include: {
                        posts: {
                            select: ["id", "title"],
                        },
                    },
                },
            },
        });

        expect(result).toHaveLength(2);
        expect(result).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    modelName: "like",
                    path: ["likes"],
                }),
                expect.objectContaining({
                    modelName: "post",
                    path: ["author", "posts"],
                }),
            ]),
        );
    });
});
