import { ModelDefinitions } from "../schema/definitions/ModelDefinitions";
import { RelationDefinition } from "../schema/definitions/RelationDefinition";
import { RelationsDefinitions } from "../schema/definitions/RelationsDefinitions";
import { ColumnType } from "../schema/helpers/ColumnType";
import { ModelName } from "../schema/helpers/ModelName";
import { Simplify } from "../util/Simplify";
import { FindManyQuery } from "./FindManyQuery";

type RelationModel<
    Models extends ModelDefinitions,
    Relations extends RelationsDefinitions<Models>,
    M extends ModelName<Models>,
    R extends keyof Relations[M],
> =
    Relations[M][R] extends RelationDefinition<Models, M>
        ? Relations[M][R]["model"]
        : never;

type RelationQuery<
    Models extends ModelDefinitions,
    Relations extends RelationsDefinitions<Models>,
    M extends ModelName<Models>,
    R extends keyof Q["include"] & keyof Relations[M],
    Q extends FindManyQuery<Models, Relations, M>,
> =
    Q["include"][R] extends FindManyQuery<
        Models,
        Relations,
        RelationModel<Models, Relations, M, R>
    >
        ? Q["include"][R]
        : never;

type IncludedRelationName<
    Models extends ModelDefinitions,
    Relations extends RelationsDefinitions<Models>,
    M extends ModelName<Models>,
    Q extends FindManyQuery<Models, Relations, M>,
> = keyof Relations[M] & keyof Q["include"];

export type FindOneQueryResult<
    Models extends ModelDefinitions,
    Relations extends RelationsDefinitions<Models>,
    M extends ModelName<Models>,
    Q extends FindManyQuery<Models, Relations, M>,
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
                      ? FindOneQueryResult<
                            Models,
                            Relations,
                            RelationModel<Models, Relations, M, R>,
                            RelationQuery<Models, Relations, M, R, Q>
                        >
                      : FindManyQueryResult<
                            Models,
                            Relations,
                            RelationModel<Models, Relations, M, R>,
                            RelationQuery<Models, Relations, M, R, Q>
                        >;
              })
    >
>;

export type FindManyQueryResult<
    Models extends ModelDefinitions,
    Relations extends RelationsDefinitions<Models>,
    M extends ModelName<Models>,
    Q extends FindManyQuery<Models, Relations, M>,
> = Simplify<FindOneQueryResult<Models, Relations, M, Q>[]>;
