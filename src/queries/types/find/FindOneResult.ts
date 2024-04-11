import { ModelDefinitions } from "../../../schema/types/definitions/ModelDefinitions";
import { RelationsDefinitions } from "../../../schema/types/definitions/RelationsDefinitions";
import { ColumnType } from "../../../schema/types/helpers/ColumnType";
import { ModelName } from "../../../schema/types/helpers/ModelName";
import { Simplify } from "../../../types/util/Simplify";
import { IncludedRelationModel } from "../include/IncludedRelationModel";
import { IncludedRelationName } from "../include/IncludedRelationName";
import { IncludedRelationQuery } from "../include/IncludedRelationQuery";
import { FindManyParams } from "./FindManyParams";
import { FindOneParams } from "./FindOneQuery";

export type FindOneResult<
    Models extends ModelDefinitions,
    Relations extends RelationsDefinitions<Models>,
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
