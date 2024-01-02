import { orm } from "@casekit/orm";

import { config } from "./config";
import * as models from "./models";

export const db = orm({ config, models });
export { config, models };
