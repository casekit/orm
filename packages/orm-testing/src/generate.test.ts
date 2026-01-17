import { describe, expect, it } from "vitest";
import { z } from "zod";

import { generate } from "./generate.js";

describe("generate", () => {
    it("generates a simple object with string fields", () => {
        const schema = z.object({
            name: z.string(),
            description: z.string(),
        });

        const result = generate(schema);

        expect(result).toEqual({
            name: expect.any(String),
            description: expect.any(String),
        });
    });

    it("generates an object with various field types", () => {
        const schema = z.object({
            id: z.uuid(),
            name: z.string(),
            age: z.number(),
            isActive: z.boolean(),
            createdAt: z.date(),
            balance: z.bigint(),
        });

        const result = generate(schema);

        expect(result).toEqual({
            id: expect.stringMatching(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
            ),
            name: expect.any(String),
            age: expect.any(Number),
            isActive: expect.any(Boolean),
            createdAt: expect.any(Date),
            balance: expect.any(Number),
        });
    });

    it("generates nested objects", () => {
        const schema = z.object({
            user: z.object({
                name: z.string(),
                email: z.email(),
            }),
            settings: z.object({
                notifications: z.boolean(),
                theme: z.string(),
            }),
        });

        const result = generate(schema);

        expect(result).toEqual({
            user: {
                name: expect.any(String),
                email: expect.stringMatching(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
            },
            settings: {
                notifications: expect.any(Boolean),
                theme: expect.any(String),
            },
        });
    });

    it("generates arrays", () => {
        const schema = z.object({
            tags: z.array(z.string()),
            scores: z.array(z.number()),
        });

        const result = generate(schema);

        expect(result.tags).toEqual(
            expect.arrayContaining([expect.any(String)]),
        );
        expect(result.scores).toEqual(
            expect.arrayContaining([expect.any(Number)]),
        );
    });

    it("generates records", () => {
        const schema = z.object({
            metadata: z.record(z.string(), z.string()),
            counts: z.record(z.number(), z.string()),
        });

        const result = generate(schema);

        expect(result).toEqual({
            metadata: {
                a: expect.any(String),
                b: expect.any(String),
                c: expect.any(String),
            },
            counts: {
                a: expect.any(String),
                b: expect.any(String),
                c: expect.any(String),
            },
        });
    });

    it("generates arrays of objects", () => {
        const schema = z.object({
            users: z.array(
                z.object({
                    id: z.uuid(),
                    name: z.string(),
                }),
            ),
        });

        const result = generate(schema);

        expect(result).toEqual({
            users: expect.arrayContaining([
                expect.objectContaining({
                    id: expect.stringMatching(
                        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
                    ),
                    name: expect.any(String),
                }),
            ]),
        });
    });

    it("applies overrides to generated data", () => {
        const schema = z.object({
            name: z.string(),
            age: z.number(),
            isActive: z.boolean(),
        });

        const result = generate(schema, {
            name: "John Doe",
            age: 30,
        });

        expect(result).toEqual({
            name: "John Doe",
            age: 30,
            isActive: expect.any(Boolean),
        });
    });

    it("handles partial overrides", () => {
        const schema = z.object({
            id: z.uuid(),
            name: z.string(),
            email: z.string(),
        });

        const result = generate(schema, {
            name: "Jane Smith",
        });

        expect(result).toEqual({
            id: expect.stringMatching(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
            ),
            name: "Jane Smith",
            email: expect.any(String),
        });
    });

    it("generates deeply nested structures", () => {
        const schema = z.object({
            level1: z.object({
                level2: z.object({
                    level3: z.object({
                        value: z.string(),
                    }),
                }),
            }),
        });

        const result = generate(schema);

        expect(result).toEqual({
            level1: {
                level2: {
                    level3: {
                        value: expect.any(String),
                    },
                },
            },
        });
    });

    it("handles unknown schema types by returning undefined", () => {
        const customSchema = z.custom<string>((val) => typeof val === "string");
        const schema = z.object({
            custom: customSchema,
        });

        const result = generate(schema);

        expect(result).toEqual({
            custom: undefined,
        });
    });

    it("generates complex mixed structures", () => {
        const schema = z.object({
            company: z.object({
                name: z.string(),
                founded: z.date(),
                employees: z.array(
                    z.object({
                        id: z.uuid(),
                        name: z.string(),
                        email: z.string(),
                        active: z.boolean(),
                    }),
                ),
                metadata: z.record(z.string(), z.string()),
            }),
        });

        const result = generate(schema);

        expect(result).toEqual({
            company: {
                name: expect.any(String),
                founded: expect.any(Date),
                employees: expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.stringMatching(
                            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
                        ),
                        name: expect.any(String),
                        email: expect.any(String),
                        active: expect.any(Boolean),
                    }),
                ]),
                metadata: {
                    a: expect.any(String),
                    b: expect.any(String),
                    c: expect.any(String),
                },
            },
        });
    });
});
