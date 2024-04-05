import { orm } from "../..";
import { config } from "./config";
import { models } from "./models";

export const db = orm({ config, models, extensions: ["uuid-ossp"] });
export { config, models };
