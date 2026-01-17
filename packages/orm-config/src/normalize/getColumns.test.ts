import { snakeCase } from "es-toolkit";
import { describe, expect, test } from "vitest";

import { getColumns } from "./getColumns.js";
import { populateModels } from "./populateModels.js";

describe("getColumns", () => {
    test("returns column names for given fields", () => {
        const models = populateModels({
            naming: { column: snakeCase },
            models: {
                user: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                        fullName: { type: "text" },
                        emailAddress: { type: "text" },
                    },
                },
            },
        });

        expect(
            getColumns(models["user"]!, ["id", "fullName", "emailAddress"]),
        ).toEqual(["id", "full_name", "email_address"]);
    });

    test("throws error for non-existent field", () => {
        const models = populateModels({
            naming: { column: snakeCase },
            models: {
                user: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                    },
                },
            },
        });

        expect(() =>
            getColumns(models["user"]!, ["id", "nonexistent"]),
        ).toThrow('Field "nonexistent" not found in model "user"');
    });

    test("returns empty array for empty fields array", () => {
        const models = populateModels({
            naming: { column: snakeCase },
            models: {
                user: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                    },
                },
            },
        });

        expect(getColumns(models["user"]!, [])).toEqual([]);
    });

    test("handles custom column names", () => {
        const models = populateModels({
            models: {
                user: {
                    fields: {
                        id: { type: "serial", primaryKey: true },
                        name: { type: "text", column: "user_full_name" },
                    },
                },
            },
        });

        expect(getColumns(models["user"]!, ["id", "name"])).toEqual([
            "id",
            "user_full_name",
        ]);
    });
});
