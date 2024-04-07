import { snakeCase } from "lodash-es";

import { orm } from "../..";
import { Models, models } from "./models";
import { Relations, relations } from "./relations";

export const db = orm({
    models,
    relations,
    extensions: ["uuid-ossp"],
    naming: { column: snakeCase },
    schema: "casekit",
});
export { models, relations };
export type { Models, Relations };
