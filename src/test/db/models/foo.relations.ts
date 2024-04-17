import { RelationsDefinition } from "../../..";
import { Models } from "../models";

export const foo = {} as const satisfies RelationsDefinition<Models, "foo">;
