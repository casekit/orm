import { fc } from "@fast-check/vitest";
import { uniqBy } from "lodash-es";

import { Model } from "../../types/schema";
import { column } from "./column";

export const model = () => {
    return fc
        .record<Model>({
            table: fc.string({ minLength: 1, maxLength: 80 }),
            schema: fc.string({ minLength: 1, maxLength: 80 }),
            columns: fc.dictionary(fc.string(), column(), {
                minKeys: 1,
                maxKeys: 65,
            }),
            constraints: fc.record({
                unique: fc.constant([]),
            }),
        })
        .map<Model>((model) => {
            // remove any duplicate column names
            const columns = uniqBy(
                Object.entries(model.columns),
                ([, c]) => c.name,
            );

            // make the first column in the list the primary key
            const [head, ...tail] = columns;
            const pk = [
                head[0],
                { ...head[1], primaryKey: true, nullable: false },
            ];

            return {
                ...model,
                columns: Object.fromEntries([pk, ...tail]),
            };
        });
};
