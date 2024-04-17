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
                  >]: Relations[M][R] extends { type: "N:1" }
                      ? FindOneResult<
                            Models,
                            Relations,
                            IncludedRelationModel<Models, Relations, M, R>,
                            IncludedRelationQuery<Models, Relations, M, R, Q>
                        >
                      : FindOneResult<
                            Models,
                            Relations,
                            IncludedRelationModel<Models, Relations, M, R>,
                            IncludedRelationQuery<Models, Relations, M, R, Q>
                        >[];
              })
    >
>;
