import { snakeCase } from "lodash-es";

import { orm } from "../..";
import { FindManyParams } from "../../queries/find/types/FindManyParams";
import { ModelName } from "../../schema/types/helpers/ModelName";
import { Models, models } from "./models";
import { Relations, relations } from "./relations";

export const db = orm({
    models,
    relations,
    extensions: ["uuid-ossp"],
    naming: { column: snakeCase },
    schema: "casekit",
});

export type FindMany<M extends ModelName<Models>> = FindManyParams<
    Models,
    Relations,
    M
>;

export { models, relations };
export type { Models, Relations };
export type DB = typeof db;
