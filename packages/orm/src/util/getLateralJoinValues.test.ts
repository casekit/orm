import { describe, expect, test } from "vitest";

import { getLateralJoinValues } from "./getLateralJoinValues.js";

describe("getLateralJoinValues", () => {
    test("should handle flat objects with direct mapping", () => {
        const results = [
            { id: 1, name: "John" },
            { id: 2, name: "Jane" },
            { id: 2, name: "Jane" }, // Duplicate to test uniqueness
        ];

        const result = getLateralJoinValues(
            results,
            [], // empty path for top-level properties
            ["id", "name"],
            ["userId", "userName"],
        );

        expect(result).toEqual([
            {
                field: "userId",
                values: [1, 2],
            },
            {
                field: "userName",
                values: ["John", "Jane"],
            },
        ]);
    });

    test("should handle nested objects with path", () => {
        const results = [
            { user: { id: 1, name: "John" } },
            { user: { id: 2, name: "Jane" } },
        ];

        const result = getLateralJoinValues(
            results,
            ["user"],
            ["id", "name"],
            ["userId", "userName"],
        );

        expect(result).toEqual([
            {
                field: "userId",
                values: [1, 2],
            },
            {
                field: "userName",
                values: ["John", "Jane"],
            },
        ]);
    });

    test("should handle missing nested objects", () => {
        const results = [
            { user: { id: 1, name: "John" } },
            { user: null },
            { user: { id: 2, name: "Jane" } },
        ];

        const result = getLateralJoinValues(
            results,
            ["user"],
            ["id", "name"],
            ["userId", "userName"],
        );

        expect(result).toEqual([
            {
                field: "userId",
                values: [1, 2],
            },
            {
                field: "userName",
                values: ["John", "Jane"],
            },
        ]);
    });

    test(" handle deeply nested paths", () => {
        const results = [
            { data: { user: { profile: { id: 1, name: "John" } } } },
            { data: { user: { profile: { id: 2, name: "Jane" } } } },
        ];

        const result = getLateralJoinValues(
            results,
            ["data", "user", "profile"],
            ["id", "name"],
            ["userId", "userName"],
        );

        expect(result).toEqual([
            {
                field: "userId",
                values: [1, 2],
            },
            {
                field: "userName",
                values: ["John", "Jane"],
            },
        ]);
    });

    test("should handle empty results array", () => {
        const results: Record<string, unknown>[] = [];

        const result = getLateralJoinValues(
            results,
            ["user"],
            ["id", "name"],
            ["userId", "userName"],
        );

        expect(result).toEqual([
            {
                field: "userId",
                values: [],
            },
            {
                field: "userName",
                values: [],
            },
        ]);
    });

    test("should handle single field mapping", () => {
        const results = [{ id: 1 }, { id: 2 }];

        const result = getLateralJoinValues(results, [], ["id"], ["userId"]);

        expect(result).toEqual([
            {
                field: "userId",
                values: [1, 2],
            },
        ]);
    });
});
