import {
    ModelDefinition,
    ModelDefinitions,
    ModelName,
    OperatorDefinitions,
    RelationDefinitions,
} from "@casekit/orm-schema";

import { WhereClause } from "./WhereClause.js";

export type IncludeCountClause<
    Models extends ModelDefinitions,
    Operators extends OperatorDefinitions,
    M extends ModelName<Models>,
    Model extends ModelDefinition = Models[M],
    Relations extends RelationDefinitions = Model["relations"] extends undefined
        ? Record<string, never>
        : NonNullable<Model["relations"]>,
> = keyof {
    [R in keyof Relations as Relations[R] extends { type: "N:1" }
        ? R
        : never]: true;
} extends never
    ? never
    : {
          [R in keyof Relations as Relations[R] extends { type: "N:1" }
              ? R
              : never]?: CountParams<
              Models,
              Operators,
              Extract<Relations[R]["model"], string>
          >;
      };

export interface CountParams<
    Models extends ModelDefinitions,
    Operators extends OperatorDefinitions,
    M extends ModelName<Models>,
> {
    include?: IncludeCountClause<Models, Operators, M>;
    where?: WhereClause<Models, Operators, M>;
    for?: "update" | "no key update" | "share" | "key share";
}
