import { ModelName } from "../../../schema/types/helpers/ModelName";
import { LooseModelDefinitions } from "../../../schema/types/loose/LooseModelDefinitions";
import { ReturningClause } from "../../clauses/ReturningClause";
import { CreateValues } from "./CreateOneParams";

export type CreateManyParams<
    Models extends LooseModelDefinitions,
    M extends ModelName<Models>,
> = {
    values: CreateValues<Models, M>[];
    returning?: ReturningClause<Models, M>;
    onConflict?: {
        do: "nothing";
    };
};
