import { RelationsDefinition } from "../../../schema/types/strict/RelationsDefinition";
import { Models } from "../models";

export const foo = {} as const satisfies RelationsDefinition<Models, "foo">;
