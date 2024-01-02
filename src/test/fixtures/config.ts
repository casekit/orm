import { createConfig } from "@casekit/orm";

import { snakeCase } from "lodash";

export const config = createConfig({
    naming: { column: snakeCase },
    schema: "casekit",
});
