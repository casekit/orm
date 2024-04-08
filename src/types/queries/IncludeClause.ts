import { ModelDefinitions } from "../schema/definitions/ModelDefinitions";
import { RelationsDefinitions } from "../schema/definitions/RelationsDefinitions";
import { ModelName } from "../schema/helpers/ModelName";
import { ManyToManyRelation } from "../schema/relations/ManyToManyRelation";
import { ManyToOneRelation } from "../schema/relations/ManyToOneRelation";
import { OneToManyRelation } from "../schema/relations/OneToManyRelation";
import { FindManyQuery } from "./FindManyQuery";

export type IncludeClause<
    Models extends ModelDefinitions,
    Relations extends RelationsDefinitions<Models>,
    M extends ModelName<Models>,
> = {
    [R in Extract<
        keyof Relations[M],
        string
    >]?: Relations[M][R] extends ManyToOneRelation<Models, M>
        ? FindManyQuery<Models, Relations, Relations[M][R]["model"]>
        : Relations[M][R] extends ManyToManyRelation<Models>
          ? FindManyQuery<Models, Relations, Relations[M][R]["model"]>
          : Relations[M][R] extends OneToManyRelation<Models>
            ? FindManyQuery<Models, Relations, Relations[M][R]["model"]>
            : never;
};
