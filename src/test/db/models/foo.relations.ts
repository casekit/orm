import { RelationsDefinition } from "src/types/schema/definitions/RelationsDefinition";

import { type Models } from "../models";

export const foo = {} satisfies RelationsDefinition<Models, "foo">;
