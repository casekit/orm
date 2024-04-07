import { orm } from "../..";
import { config } from "./config";
import { Models, models } from "./models";
import { Relations, relations } from "./relations";

export const db = orm({ config, models, relations, extensions: ["uuid-ossp"] });
export { config, models, relations };
export type { Models, Relations };
