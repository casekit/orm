import { mapValues, uniq } from "es-toolkit";
import { z } from "zod";

import { NormalizedConfig } from "@casekit/orm-config";
import { ModelDefinitions, ModelName, ModelType } from "@casekit/orm-schema";

import { generate } from "./generate.js";

export type Factory<Models extends ModelDefinitions> = {
    [M in ModelName<Models>]: (
        overrides?: Partial<ModelType<Models[M]>>,
    ) => ModelType<Models[M]>;
};

export const makeFactory = <Models extends ModelDefinitions>(
    config: NormalizedConfig,
): Factory<Models> => {
    return mapValues(config.models, (model) => {
        // We never want to generate foreign key values
        // as there's no way for us to know how to generate
        // valid ones. This is up to the user to provide.
        const fkOverrides = Object.fromEntries(
            uniq(model.foreignKeys.flatMap((fk) => fk.fields)).map((fk) => [
                fk,
                null,
            ]),
        );

        const fields = Object.entries(model.fields)
            .filter(([_, f]) => !f.provided)
            .map(([name, f]) => [
                name,
                f.default
                    ? f.zodSchema.optional()
                    : f.nullable
                      ? f.zodSchema.nullable()
                      : f.zodSchema,
            ]);

        const schema = z.object(Object.fromEntries(fields));
        return (overrides: Record<string, unknown>) => ({
            ...generate(schema),
            ...fkOverrides,
            ...overrides,
        });
    }) as Factory<Models>;
};
