import { RelationsDefinition } from "../../../schema/types/strict/RelationsDefinition";
import { type Models } from "../models";

export const foo = {} as const satisfies RelationsDefinition<Models, "foo">;
