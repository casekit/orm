import {
    FieldType,
    ManyToOneRelationDefinition,
    ModelDefinitions,
    ModelName,
    OperatorDefinitions,
    RelationDefinition,
} from "@casekit/orm-schema";
import { Simplify } from "@casekit/toolbox";

import { FindParams } from "./FindParams.js";

export type RelationModelName<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
    R extends keyof Models[M]["relations"],
> = Models[M]["relations"][R] extends RelationDefinition
    ? Extract<Models[M]["relations"][R]["model"], ModelName<Models>>
    : never;

export type IncludedRelationName<
    Models extends ModelDefinitions,
    Operators extends OperatorDefinitions,
    M extends ModelName<Models>,
    Q extends FindParams<Models, Operators, M>,
> = Extract<keyof Q["include"], keyof Models[M]["relations"]>;

export type IncludedRelationQuery<
    Models extends ModelDefinitions,
    Operators extends OperatorDefinitions,
    M extends ModelName<Models>,
    R extends keyof Q["include"] & keyof Models[M]["relations"],
    Q extends FindParams<Models, Operators, M>,
> = Extract<
    Q["include"][R],
    FindParams<Models, Operators, RelationModelName<Models, M, R>>
>;

export type FindResult<
    Models extends ModelDefinitions,
    Operators extends OperatorDefinitions,
    M extends ModelName<Models>,
    Q extends FindParams<Models, Operators, M>,
> = Simplify<
    {
        [C in Q["select"][number]]: FieldType<Models[M], C>;
    } & (undefined extends Q["include"]
        ? unknown
        : {
              [R in IncludedRelationName<
                  Models,
                  Operators,
                  M,
                  Q
              >]: Models[M]["relations"][R] extends { optional: true }
                  ? FindResult<
                        Models,
                        Operators,
                        RelationModelName<Models, M, R>,
                        IncludedRelationQuery<Models, Operators, M, R, Q>
                    > | null
                  : Models[M]["relations"][R] extends ManyToOneRelationDefinition
                    ? // otherwise the included relation is required
                      FindResult<
                          Models,
                          Operators,
                          RelationModelName<Models, M, R>,
                          IncludedRelationQuery<Models, Operators, M, R, Q>
                      >
                    : // for other types of relation, the included relation is an array
                      FindResult<
                          Models,
                          Operators,
                          RelationModelName<Models, M, R>,
                          IncludedRelationQuery<Models, Operators, M, R, Q>
                      >[];
          })
>;
