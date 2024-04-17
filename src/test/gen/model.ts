import { fc } from "@fast-check/vitest";
import { drop, take, uniqBy } from "lodash-es";

import { UniqueConstraint } from "../../schema/types/constraints/UniqueConstraint";
import { LooseModelDefinition } from "../../schema/types/loose/LooseModelDefinition";
import { column } from "./column";

export const model = () => {
    return fc
        .tuple(
            fc.record<LooseModelDefinition>({
                table: fc.string({ minLength: 1, maxLength: 80 }),
                schema: fc.string({ minLength: 1, maxLength: 80 }),
                columns: fc.dictionary(fc.string({ minLength: 1 }), column(), {
                    minKeys: 1,
                    maxKeys: 65,
                }),
                primaryKey: fc.constant([]),
                uniqueConstraints: fc.constant([]),
                foreignKeys: fc.constant([]),
            }),
            fc.integer({ min: 1, max: 2 }), // no of primary keys
            fc.integer({ min: 0, max: 2 }), // no of unique constraints
        )
        .map<LooseModelDefinition>(
            ([model, numPrimaryKeyColumns, numUniqueColumns]) => {
                // remove any duplicate column names
                const columns = uniqBy(
                    Object.entries(model.columns),
                    ([, c]) => c.name,
                );

                // take the first n columns as the primary key, if one has been specified
                const primaryKeyColumns = take(columns, numPrimaryKeyColumns);

                // and columns after it as the unique columns, if they have been specified
                const uniqueKeyColumns = take(
                    drop(columns, numPrimaryKeyColumns),
                    numUniqueColumns,
                );

                const primaryKey = primaryKeyColumns.map(
                    ([, c]) => c.name as string,
                );

                const uniqueConstraints = uniqueKeyColumns.map(([, c]) => ({
                    columns: [c.name as string],
                })) as UniqueConstraint[];

                return {
                    ...model,
                    columns: Object.fromEntries(columns),
                    primaryKey,
                    uniqueConstraints,
                };
            },
        );
};
