import { ModelName } from "../../../schema/types/helpers/ModelName";
import { LooseModelDefinitions } from "../../../schema/types/loose/LooseModelDefinitions";
import { LooseRelationsDefinitions } from "../../../schema/types/loose/LooseRelationsDefinitions";
import { WhereClause } from "../../clauses/WhereClause";

export type IncludeHasOneRelationsClause<
    Models extends LooseModelDefinitions,
    Relations extends LooseRelationsDefinitions<Models>,
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
    Models extends LooseModelDefinitions,
    Relations extends LooseRelationsDefinitions<Models>,
    M extends ModelName<Models>,
> = {
    where?: WhereClause<Models, M>;
    include?: IncludeHasOneRelationsClause<Models, Relations, M>;
};
