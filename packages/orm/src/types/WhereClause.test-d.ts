import { describe, test } from "vitest";

import { Models, Operators } from "@casekit/orm-fixtures";
import { OperatorDefinitions } from "@casekit/orm-schema";
import { sql } from "@casekit/sql";

import {
    $and,
    $gt,
    $gte,
    $ilike,
    $in,
    $is,
    $like,
    $lt,
    $not,
    $or,
} from "#operators.js";
import type { WhereClause } from "./WhereClause.js";

describe("WhereClause", () => {
    test("basic value comparisons", () => {
        const _ = {
            name: "John",
            createdAt: { [$gt]: new Date("2000-01-01") },
        } satisfies WhereClause<Models, Operators, "user">;
    });

    test("logical operators", () => {
        const _ = {
            [$or]: [
                { name: { [$like]: "John%" } },
                {
                    [$and]: [
                        { createdAt: { [$gte]: new Date("2000-01-01") } },
                        { createdAt: { [$lt]: new Date("2024-01-01") } },
                    ],
                },
            ],
        } satisfies WhereClause<Models, Operators, "user">;
    });

    test("null checks with $is", () => {
        const _ = {
            name: { [$is]: null },
            createdAt: { [$is]: null },
        } satisfies WhereClause<Models, Operators, "user">;
    });

    test("null checks with $not", () => {
        const _ = {
            name: { [$is]: null },
            createdAt: { [$not]: null },
        } satisfies WhereClause<Models, Operators, "user">;
    });

    test("boolean checks with $is", () => {
        const _ = {
            name: { [$is]: null },
            createdAt: { [$is]: false },
        } satisfies WhereClause<Models, Operators, "user">;
    });

    test("boolean checks with $not", () => {
        const _ = {
            name: { [$is]: null },
            createdAt: { [$not]: true },
        } satisfies WhereClause<Models, Operators, "user">;
    });

    test("string operations", () => {
        const _ = {
            name: {
                [$like]: "%doe%",
                [$ilike]: "JOHN%",
            },
            email: { [$in]: ["john@example.com", "jane@example.com"] },
        } satisfies WhereClause<Models, Operators, "user">;
    });

    test("compound conditions", () => {
        const _ = {
            [$and]: [
                {
                    createdAt: {
                        [$gte]: new Date("2000-01-01"),
                        [$lt]: new Date("2024-01-01"),
                    },
                },
                {
                    [$or]: [
                        { email: { [$like]: "%@company.com" } },
                        { role: { [$in]: ["admin", "user"] } },
                    ],
                },
            ],
        } satisfies WhereClause<Models, Operators, "user">;
    });

    test("custom operators", () => {
        const $startswith = Symbol("startswith");
        const operators = {
            where: {
                [$startswith]: ({ table, column }, value) =>
                    sql`${table}.${column} LIKE ${value}%`,
            },
        } as const satisfies OperatorDefinitions;

        const _ = {
            name: { [$startswith]: "John" },
        } satisfies WhereClause<Models, typeof operators, "user">;
    });

    describe("invalid queries", () => {
        test("wrong type", () => {
            const _ = {
                // @ts-expect-error name should be string
                name: 621,
            } satisfies WhereClause<Models, Operators, "user">;
        });

        test("non existent column", () => {
            const _ = {
                // @ts-expect-error non existent column
                wrong: "x",
            } satisfies WhereClause<Models, Operators, "user">;
        });

        test("invalid $in value", () => {
            const _ = {
                role: {
                    // @ts-expect-error invalid $in value
                    [$in]: ["admin", "user", "wrong"],
                },
            } satisfies WhereClause<Models, Operators, "user">;
        });

        test("invalid $is value", () => {
            const _ = {
                name: {
                    // @ts-expect-error $is only works with null or boolean
                    [$is]: "test",
                },
            } satisfies WhereClause<Models, Operators, "user">;
        });

        test("invalid $like value", () => {
            const _ = {
                counter: {
                    // @ts-expect-error $like only works with string
                    [$like]: 123,
                },
            } satisfies WhereClause<Models, Operators, "counter">;
        });

        test("invalid $and value", () => {
            const _ = {
                [$and]:
                    // @ts-expect-error should be an array
                    { createdAt: { [$gt]: Date } },
            } satisfies WhereClause<Models, Operators, "user">;
        });

        test("invalid $not value", () => {
            const _ = {
                // @ts-expect-error $not should take an object, not an array
                [$not]: [{ age: 21 }],
            } satisfies WhereClause<Models, Operators, "user">;
        });
    });
});
