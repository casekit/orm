import { describe, test } from "vitest";

import { Conform } from "./Conform.js";

interface Person {
    name: string;
    age: number;
}

describe("Conform", () => {
    test("should allow exact matching types", () => {
        const _: Conform<Person, { name: string; age: number }> = {
            name: "John",
            age: 30,
        };
    });

    test("should not allow extra properties", () => {
        const _person: Conform<Person, Person> = {
            name: "John",
            age: 30,
            // @ts-expect-error - Extra property 'email' is not allowed
            email: "john@example.com",
        };
    });

    test("should not allow missing properties", () => {
        // @ts-expect-error - Missing property 'age'
        const _person: Conform<Person, Person> = { name: "John" };
    });
});
