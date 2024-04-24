import { ModelName } from "../../../schema/types/helpers/ModelName";
import { LooseModelDefinitions } from "../../../schema/types/loose/LooseModelDefinitions";
import { Simplify } from "../../../types/util/Simplify";
import { ReturningClause } from "../../clauses/ReturningClause";
import { OptionalParams } from "../../clauses/helpers/OptionalParams";
import { RequiredParams } from "../../clauses/helpers/RequiredParams";

export type CreateValues<
    Models extends LooseModelDefinitions,
    M extends ModelName<Models>,
> = Simplify<RequiredParams<Models, M> & OptionalParams<Models, M>>;

export type CreateOneParams<
    Models extends LooseModelDefinitions,
    M extends ModelName<Models>,
> = {
    values: CreateValues<Models, M>;
    returning?: ReturningClause<Models[M]>;
    onConflict?: {
        do: "nothing";
    };
};
