import { ModelDefinitions } from "../../schema/types/definitions/ModelDefinitions";
import { RelationsDefinitions } from "../../schema/types/definitions/RelationsDefinitions";
import { ColumnType } from "../../schema/types/helpers/ColumnType";
import { ModelName } from "../../schema/types/helpers/ModelName";
import { Simplify } from "../../types/util/Simplify";
import { FindManyQuery } from "./FindManyQuery";
import { FindOneQuery } from "./FindOneQuery";
import { IncludedRelationModel } from "./include/IncludedRelationModel";
import { IncludedRelationName } from "./include/IncludedRelationName";
import { IncludedRelationQuery } from "./include/IncludedRelationQuery";

export type QueryResult<
    Models extends ModelDefinitions,
    Relations extends RelationsDefinitions<Models>,
    M extends ModelName<Models>,
    Q extends
        | FindManyQuery<Models, Relations, M>
        | FindOneQuery<Models, Relations, M>,
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
                      ? QueryResult<
                            Models,
                            Relations,
                            IncludedRelationModel<Models, Relations, M, R>,
                            IncludedRelationQuery<Models, Relations, M, R, Q>
                        >
                      : QueryResult<
                            Models,
                            Relations,
                            IncludedRelationModel<Models, Relations, M, R>,
                            IncludedRelationQuery<Models, Relations, M, R, Q>
                        >[];
              })
    >
>;
