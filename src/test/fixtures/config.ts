import { snakeCase } from "lodash-es";

import { createConfig } from "../..";

export const config = createConfig({
    naming: { column: snakeCase },
    schema: "casekit",
});
