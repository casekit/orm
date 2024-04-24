import { ColumnType } from "../../../schema/types/helpers/ColumnType";
import { ModelName } from "../../../schema/types/helpers/ModelName";
import { LooseModelDefinitions } from "../../../schema/types/loose/LooseModelDefinitions";
import { ReturningClause } from "../../clauses/ReturningClause";
import { UpdateParams } from "./UpdateParams";

export type UpdateManyResult<
    Models extends LooseModelDefinitions,
    M extends ModelName<Models>,
    P extends UpdateParams<Models, M>,
> =
    P["returning"] extends ReturningClause<Models[M]>
        ? Readonly<{
              [C in P["returning"][number]]: ColumnType<Models, M, C>;
          }>[]
        : number;
