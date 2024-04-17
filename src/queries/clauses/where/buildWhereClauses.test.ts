import { describe, expect, test } from "vitest";

import { ModelName } from "../../../schema/types/helpers/ModelName";
import { LooseModelDefinitions } from "../../../schema/types/loose/LooseModelDefinitions";
import { db } from "../../../test/db";
import { WhereClause } from "../types/../WhereClause";
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
        [{ a: "foo" }, "(a.a = $1)", ["foo"]],
        [
            { timestamp: { [$gt]: new Date(2024, 1, 1) } },
            `(a.timestamp > $1)`,
            [new Date(2024, 1, 1)],
        ],
        [
            { timestamp: { [$gte]: new Date(2024, 1, 3) } },
            "(a.timestamp >= $1)",
            [new Date(2024, 1, 3)],
        ],
        [{ bigint: { [$lt]: 47 } }, "(a.bigint < $1)", [47]],
        [
            { timestamp: { [$lte]: new Date(2024, 1, 3) } },
            "(a.timestamp <= $1)",
            [new Date(2024, 1, 3)],
        ],

        [{ id: 3, text: "foo" }, "(a.id = $1 AND a.text = $2)", [3, "foo"]],
        [
            { id: 3, text: { [$like]: "foo%" } },
            "(a.id = $1 AND a.text LIKE $2)",
            [3, "foo%"],
        ],
        [
            { id: 3, text: { [$ilike]: "foo%" } },
            "(a.id = $1 AND a.text ILIKE $2)",
            [3, "foo%"],
        ],
        [
            { id: 3, text: { [$ne]: "Russell" } },
            "(a.id = $1 AND a.text != $2)",
            [3, "Russell"],
        ],
        [
            { id: 3, text: { [$not]: null } },
            "(a.id = $1 AND a.text IS NOT NULL)",
            [3],
        ],
        [
            { id: 3, text: { [$is]: true } },
            "(a.id = $1 AND a.text IS $2)",
            [3, true],
        ],
        [
            { [$and]: [{ id: 3 }, { text: "foo" }] },
            "(((a.id = $1) AND (a.text = $2)))",
            [3, "foo"],
        ],
        [
            { [$or]: [{ id: 3 }, { text: "foo" }] },
            "(((a.id = $1) OR (a.text = $2)))",
            [3, "foo"],
        ],
        [
            { [$not]: { [$or]: [{ text: "foo" }, { text: "bar" }] } },
            "(NOT (((a.text = $1) OR (a.text = $2))))",
            ["foo", "bar"],
        ],
        [
            { text: { [$in]: ["cat", "dog", "fish"] } },
            "(a.text IN ($1, $2, $3))",
            ["cat", "dog", "fish"],
        ],
        [{ text: { [$in]: [] } }, "(a.text IN (NULL))", []],
        [
            {
                [$not]: {
                    [$and]: [
                        { text: "foo" },
                        {
                            [$or]: [
                                {
                                    [$and]: [
                                        { text: 1, renamedColumn: 2 },
                                        { renamedColumn: 3 },
                                    ],
                                },
                                { [$or]: [{ text: 3 }, { renamedColumn: 5 }] },
                                { renamedColumn: 333 },
                            ],
                        },
                    ],
                },
            },
            "(NOT (((a.text = $1) AND (((((a.text = $2 AND a.original_name = $3) AND (a.original_name = $4))) OR (((a.text = $5) OR (a.original_name = $6))) OR (a.original_name = $7))))))",
            ["foo", 1, 2, 3, 3, 5, 333],
        ],
        [
            { [$or]: [{ text: 1, renamedColumn: 2 }, { text: 3 }] },
            "(((a.text = $1 AND a.original_name = $2) OR (a.text = $3)))",
            [1, 2, 3],
        ],
    ])(
        "Where clause of %s returns SQL %s with variables %s",
        (
            where: WhereClause<
                LooseModelDefinitions,
                ModelName<LooseModelDefinitions>
            >,
            sql: string,
            values: unknown[],
        ) => {
            const clause = buildWhereClauses(
                db.config,
                { name: "foo", schema: "casekit", model: "foo", alias: "a" },
                where,
            );
            expect(clause.text).toEqual(sql);
            expect(clause.values).toEqual(values);
        },
    );
});
