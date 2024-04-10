import { describe, expect, test } from "vitest";

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
        [{ name: "foo" }, "(a.name = $1)", ["foo"]],
        [
            { created_at: { [$gt]: new Date(2024, 1, 1) } },
            "(a.created_at > $1)",
            [new Date(2024, 1, 1)],
        ],
        [{ count: { [$gte]: 47 } }, "(a.count >= $1)", [47]],
        [{ count: { [$lt]: 47 } }, "(a.count < $1)", [47]],
        [{ count: { [$lte]: 47 } }, "(a.count <= $1)", [47]],

        [{ id: 3, name: "foo" }, "(a.id = $1 AND a.name = $2)", [3, "foo"]],
        [
            { id: 3, name: { [$like]: "foo%" } },
            "(a.id = $1 AND a.name LIKE $2)",
            [3, "foo%"],
        ],
        [
            { id: 3, name: { [$ilike]: "foo%" } },
            "(a.id = $1 AND a.name ILIKE $2)",
            [3, "foo%"],
        ],
        [
            { id: 3, name: { [$ne]: "Russell" } },
            "(a.id = $1 AND a.name != $2)",
            [3, "Russell"],
        ],
        [
            { id: 3, name: { [$not]: null } },
            "(a.id = $1 AND a.name IS NOT NULL)",
            [3],
        ],
        [
            { id: 3, enabled: { [$is]: true } },
            "(a.id = $1 AND a.enabled IS $2)",
            [3, true],
        ],
        [
            { [$and]: [{ id: 3 }, { name: "foo" }] },
            "(((a.id = $1) AND (a.name = $2)))",
            [3, "foo"],
        ],
        [
            { [$or]: [{ id: 3 }, { name: "foo" }] },
            "(((a.id = $1) OR (a.name = $2)))",
            [3, "foo"],
        ],
        [
            { [$not]: { [$or]: [{ name: "foo" }, { name: "bar" }] } },
            "(NOT (((a.name = $1) OR (a.name = $2))))",
            ["foo", "bar"],
        ],
        [
            {
                [$not]: {
                    [$and]: [
                        { name: "foo" },
                        {
                            [$or]: [
                                { [$and]: [{ x: 1, y: 2 }, { z: 3 }] },
                                { [$or]: [{ a: 3 }, { b: 5 }] },
                                { z: 333 },
                            ],
                        },
                    ],
                },
            },
            "(NOT (((a.name = $1) AND (((((a.x = $2 AND a.y = $3) AND (a.z = $4))) OR (((a.a = $5) OR (a.b = $6))) OR (a.z = $7))))))",
            ["foo", 1, 2, 3, 3, 5, 333],
        ],
        [
            { [$or]: [{ x: 1, y: 2 }, { z: 3 }] },
            "(((a.x = $1 AND a.y = $2) OR (a.z = $3)))",
            [1, 2, 3],
        ],
    ])(
        "Where clause of %s returns SQL %s with variables %s",
        (
            where: WhereClause<ModelDefinitions, ModelName<ModelDefinitions>>,
            sql: string,
            values: unknown[],
        ) => {
            const clause = buildWhereClauses("a", where);
            expect(clause.text).toEqual(sql);
            expect(clause.values).toEqual(values);
        },
    );
});
