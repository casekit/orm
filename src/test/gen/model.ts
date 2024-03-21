import { fc } from "@fast-check/vitest";
import { uniqBy } from "lodash";
import { Model } from "~/types/schema";

import { column } from "./column";

export const model = () => {
    return (
        fc
            .record<Model>({
                table: fc.string({ minLength: 1, maxLength: 80 }),
                schema: fc.string({ minLength: 1, maxLength: 80 }),
                columns: fc.dictionary(fc.string(), column(), {
                    minKeys: 1,
                    maxKeys: 65,
                }),
            })
            // make sure our generated models have a primary key
            .filter((r) => !!Object.values(r.columns).find((c) => c.primaryKey))
            // remove any duplicate column names
            .map((r) => ({
                ...r,
                columns: Object.fromEntries(
                    uniqBy(Object.entries(r.columns), ([, c]) => c.name),
                ),
            }))
    );
};
