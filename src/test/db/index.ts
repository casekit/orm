import { snakeCase } from "lodash-es";

import { orm } from "../..";
import { ModelName } from "../../types/schema/helpers/ModelName";
import { FindManyQuery } from "../../types/schema/helpers/queries/FindManyQuery";
import { Models, models } from "./models";
import { Relations, relations } from "./relations";

export const db = orm({
    models,
    relations,
    extensions: ["uuid-ossp"],
    naming: { column: snakeCase },
    schema: "casekit",
});

export type FindMany<M extends ModelName<Models>> = FindManyQuery<
    Models,
    Relations,
    M
>;

export { models, relations };
export type { Models, Relations };
export type DB = typeof db;
