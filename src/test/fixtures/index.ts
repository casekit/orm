import { orm } from "@casekit/orm";

import { config } from "./config";
import * as models from "./models";

export const db = orm({ config, models, extensions: ["uuid-ossp"] });
export { config, models };
