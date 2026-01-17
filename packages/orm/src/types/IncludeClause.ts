import {
    ModelDefinition,
    ModelDefinitions,
    ModelName,
    OperatorDefinitions,
    RelationDefinitions,
    RelationName,
} from "@casekit/orm-schema";

import { FindParams } from "./FindParams.js";

export type IncludeClause<
    Models extends ModelDefinitions,
    Operators extends OperatorDefinitions,
    M extends ModelName<Models>,
    Model extends ModelDefinition = Models[M],
    Relations extends RelationDefinitions = Model["relations"] extends undefined
        ? Record<string, never>
        : NonNullable<Model["relations"]>,
> =
    Models[M]["relations"] extends NonNullable<Models[M]["relations"]>
        ? {
              [R in RelationName<Model>]?: FindParams<
                  Models,
                  Operators,
                  Extract<Relations[R]["model"], string>
              >;
          }
        : never;
