import { RelationsDefinition } from "src/schema/types/definitions/RelationsDefinition";

import { type Models } from "../models";

export const foo = {} as const satisfies RelationsDefinition<Models, "foo">;
