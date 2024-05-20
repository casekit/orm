import { ColumnType } from "../../../schema/types/helpers/ColumnType";
import { ModelName } from "../../../schema/types/helpers/ModelName";
import { LooseModelDefinitions } from "../../../schema/types/loose/LooseModelDefinitions";
import { LooseRelationsDefinitions } from "../../../schema/types/loose/LooseRelationsDefinitions";
import { Simplify } from "../../../types/util/Simplify";
import { IncludedRelationModel } from "../../clauses/include/IncludedRelationModel";
import { IncludedRelationName } from "../../clauses/include/IncludedRelationName";
import { IncludedRelationQuery } from "../../clauses/include/IncludedRelationQuery";
import { FindManyParams } from "./FindManyParams";
import { FindOneParams } from "./FindOneParams";

/**
 * this is a mess and needs refactoring
 */
export type FindOneResult<
    Models extends LooseModelDefinitions,
    Relations extends LooseRelationsDefinitions<Models>,
    M extends ModelName<Models>,
    Q extends
        | FindManyParams<Models, Relations, M>
        | FindOneParams<Models, Relations, M>,
> = Readonly<
    Simplify<
        {
            [C in Extract<Q["select"][number], string>]: ColumnType<
                Models,
                M,
                C
            >;
        } & (undefined extends Q["include"]
            ? unknown
            : {
                  [R in IncludedRelationName<
                      Models,
                      Relations,
                      M,
                      Q
                      // for each optional N:1 relation
                  >]: Relations[M][R] extends {
                      type: "N:1";
                      optional: true;
                  }
                      ? // if its foreign key is optional, the included relation
                        // needs to be optional too
                        // TODO this currently doesn't work for compound primary keys
                        // need to figure out a way to make it work,
                        // and also to refactor this mess to be more readable
                        | FindOneResult<
                                  Models,
                                  Relations,
                                  IncludedRelationModel<
                                      Models,
                                      Relations,
                                      M,
                                      R
                                  >,
                                  IncludedRelationQuery<
                                      Models,
                                      Relations,
                                      M,
                                      R,
                                      Q
                                  >
                              >
                            | undefined
                      : Relations[M][R] extends {
                              type: "N:1";
                          }
                        ? // otherwise the included relation is required
                          FindOneResult<
                              Models,
                              Relations,
                              IncludedRelationModel<Models, Relations, M, R>,
                              IncludedRelationQuery<Models, Relations, M, R, Q>
                          >
                        : // for other types of relation, the included relation is an array
                          FindOneResult<
                              Models,
                              Relations,
                              IncludedRelationModel<Models, Relations, M, R>,
                              IncludedRelationQuery<Models, Relations, M, R, Q>
                          >[];
              })
    >
>;
