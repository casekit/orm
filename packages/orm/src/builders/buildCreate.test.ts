import { describe, expect, test } from "vitest";

import { createTestDB } from "../tests/util/db.js";
import { buildCreate } from "./buildCreate.js";

describe("buildCreate", () => {
    const { db } = createTestDB();

    test("should build a create query", () => {
        const result = buildCreate(db.config, [], "user", {
            values: [{ id: 1, name: "John Doe", email: "john@example.com" }],
        });

        expect(result).toEqual({
            table: {
                schema: "orm",
                name: "user",
                alias: "a",
                model: "user",
            },
            columns: ["id", "name", "email"],
            values: [[1, "John Doe", "john@example.com"]],
            returning: [],
            onConflict: undefined,
        });
    });

    test("should throw an error if model is not found", () => {
        expect(() =>
            buildCreate(db.config, [], "NonExistentModel", {
                values: [
                    { id: 1, name: "John Doe", email: "john@example.com" },
                ],
            }),
        ).toThrow('Model "NonExistentModel" not found');
    });

    test("should handle returning fields", () => {
        const result = buildCreate(db.config, [], "user", {
            values: [{ id: 1, name: "John Doe", email: "john@example.com" }],
            returning: ["id", "name"],
        });

        expect(result.returning).toEqual([
            { name: "id", alias: "a_0", path: ["id"] },
            { name: "name", alias: "a_1", path: ["name"] },
        ]);
    });

    test("should handle onConflict", () => {
        const result = buildCreate(db.config, [], "user", {
            values: [{ id: 1, name: "John Doe", email: "john@example.com" }],
            onConflict: { do: "nothing" },
        });

        expect(result.onConflict).toEqual({ do: "nothing" });
    });
});
