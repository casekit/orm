import { snakeCase } from "lodash";

import { createConfig } from "../..";

export const config = createConfig({
    naming: { column: snakeCase },
    schema: "casekit",
});
