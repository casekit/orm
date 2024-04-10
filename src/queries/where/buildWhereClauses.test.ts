import { describe, expect, test } from "vitest";

import { db } from "../../test/db";
import { WhereClause } from "../../types/queries/WhereClause";
import { ModelDefinitions } from "../../types/schema/definitions/ModelDefinitions";
import { ModelName } from "../../types/schema/helpers/ModelName";
import { buildWhereClauses } from "./buildWhereClauses";
import {
    $and,
    $eq,
    $gt,
    $gte,
    $ilike,
    $in,
    $is,
    $like,
    $lt,
    $lte,
    $ne,
    $not,
    $or,
} from "./operators";

/**
 * NB. The dollars in the resulting SQL render as `undefined` in the test output,
 * but do generate (and test!) the SQL correctly. This is due to a limitation
 * of vitest.each that I haven't figured a way round yet.
 */
describe("buildWhereClauses", () => {
    test.each([
        [{ id: 3 }, "(a.id = $1)", [3]],
        [{ id: { [$eq]: 3 } }, "(a.id = $1)", [3]],
        [{ username: "foo" }, "(a.username = $1)", ["foo"]],
        [
            { joinedAt: { [$gt]: new Date(2024, 1, 1) } },
            "(a.created_at > $1)",
            [new Date(2024, 1, 1)],
        ],
        [
            { joinedAt: { [$gte]: new Date(2024, 1, 3) } },
            "(a.created_at >= $1)",
            [new Date(2024, 1, 3)],
        ],
        [
            { joinedAt: { [$lt]: new Date(2024, 1, 3) } },
            "(a.created_at < $1)",
            [new Date(2024, 1, 3)],
        ],
        [
            { joinedAt: { [$lte]: new Date(2024, 1, 3) } },
            "(a.created_at <= $1)",
            [new Date(2024, 1, 3)],
        ],

        [
            { id: 3, username: "foo" },
            "(a.id = $1 AND a.username = $2)",
            [3, "foo"],
        ],
        [
            { id: 3, username: { [$like]: "foo%" } },
            "(a.id = $1 AND a.username LIKE $2)",
            [3, "foo%"],
        ],
        [
            { id: 3, username: { [$ilike]: "foo%" } },
            "(a.id = $1 AND a.username ILIKE $2)",
            [3, "foo%"],
        ],
        [
            { id: 3, username: { [$ne]: "Russell" } },
            "(a.id = $1 AND a.username != $2)",
            [3, "Russell"],
        ],
        [
            { id: 3, username: { [$not]: null } },
            "(a.id = $1 AND a.username IS NOT NULL)",
            [3],
        ],
        [
            { id: 3, username: { [$is]: true } },
            "(a.id = $1 AND a.username IS $2)",
            [3, true],
        ],
        [
            { [$and]: [{ id: 3 }, { username: "foo" }] },
            "(((a.id = $1) AND (a.username = $2)))",
            [3, "foo"],
        ],
        [
            { [$or]: [{ id: 3 }, { username: "foo" }] },
            "(((a.id = $1) OR (a.username = $2)))",
            [3, "foo"],
        ],
        [
            { [$not]: { [$or]: [{ username: "foo" }, { username: "bar" }] } },
            "(NOT (((a.username = $1) OR (a.username = $2))))",
            ["foo", "bar"],
        ],
        [
            { username: { [$in]: ["cat", "dog", "fish"] } },
            "(a.username IN ($1, $2, $3))",
            ["cat", "dog", "fish"],
        ],
        [
            {
                [$not]: {
                    [$and]: [
                        { username: "foo" },
                        {
                            [$or]: [
                                {
                                    [$and]: [
                                        { username: 1, joinedAt: 2 },
                                        { joinedAt: 3 },
                                    ],
                                },
                                { [$or]: [{ username: 3 }, { joinedAt: 5 }] },
                                { joinedAt: 333 },
                            ],
                        },
                    ],
                },
            },
            "(NOT (((a.username = $1) AND (((((a.username = $2 AND a.created_at = $3) AND (a.created_at = $4))) OR (((a.username = $5) OR (a.created_at = $6))) OR (a.created_at = $7))))))",
            ["foo", 1, 2, 3, 3, 5, 333],
        ],
        [
            { [$or]: [{ username: 1, joinedAt: 2 }, { username: 3 }] },
            "(((a.username = $1 AND a.created_at = $2) OR (a.username = $3)))",
            [1, 2, 3],
        ],
    ])(
        "Where clause of %s returns SQL %s with variables %s",
        (
            where: WhereClause<ModelDefinitions, ModelName<ModelDefinitions>>,
            sql: string,
            values: unknown[],
        ) => {
            const clause = buildWhereClauses(
                db.config,
                { name: "user", schema: "casekit", model: "user", alias: "a" },
                where,
            );
            expect(clause.text).toEqual(sql);
            expect(clause.values).toEqual(values);
        },
    );
});
