import { fc } from "@fast-check/vitest";
import { drop, take, uniqBy } from "lodash-es";

import { Model } from "../../types/schema";
import { column } from "./column";

export const model = () => {
    return fc
        .tuple(
            fc.record<Omit<Model, "constraints">>({
                table: fc.string({ minLength: 1, maxLength: 80 }),
                schema: fc.string({ minLength: 1, maxLength: 80 }),
                columns: fc.dictionary(fc.string({ minLength: 1 }), column(), {
                    minKeys: 1,
                    maxKeys: 65,
                }),
            }),
            fc.integer({ min: 1, max: 2 }), // no of primary keys
            fc.integer({ min: 0, max: 2 }), // no of unique constraints
        )
        .map<Model>(([model, numPrimaryKeyColumns, numUniqueColumns]) => {
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

            return {
                ...model,
                columns: Object.fromEntries(columns),
                constraints: {
                    primaryKey: primaryKeyColumns.map(([, c]) => c.name),
                    unique: uniqueKeyColumns.map(([, c]) => ({
                        columns: [c.name],
                    })),
                },
            };
        });
};
