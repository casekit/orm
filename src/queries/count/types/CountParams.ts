import { ModelDefinitions } from "../../../schema/types/definitions/ModelDefinitions";
import { RelationsDefinitions } from "../../../schema/types/definitions/RelationsDefinitions";
import { ModelName } from "../../../schema/types/helpers/ModelName";
import { WhereClause } from "../../clauses/WhereClause";

export type IncludeHasOneRelationsClause<
    Models extends ModelDefinitions,
    Relations extends RelationsDefinitions<Models>,
    M extends ModelName<Models>,
> = {
    [R in Extract<keyof Relations[M], string>]?: Relations[M][R] extends {
        model: ModelName<Models>;
    }
        ? Relations[M][R] extends { type: "N:1" }
            ? CountParams<Models, Relations, Relations[M][R]["model"]>
            : never
        : never;
};

export type CountParams<
    Models extends ModelDefinitions,
    Relations extends RelationsDefinitions<Models>,
    M extends ModelName<Models>,
> = {
    where?: WhereClause<Models, M>;
    include?: IncludeHasOneRelationsClause<Models, Relations, M>;
};
