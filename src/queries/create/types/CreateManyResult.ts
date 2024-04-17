import { ColumnType } from "../../../schema/types/helpers/ColumnType";
import { ModelName } from "../../../schema/types/helpers/ModelName";
import { LooseModelDefinitions } from "../../../schema/types/loose/LooseModelDefinitions";
import { ReturningClause } from "../../clauses/ReturningClause";
import { CreateManyParams } from "./CreateManyParams";
import { CreateOneParams } from "./CreateOneParams";

export type CreateManyResult<
    Models extends LooseModelDefinitions,
    M extends ModelName<Models>,
    P extends CreateOneParams<Models, M> | CreateManyParams<Models, M>,
> =
    P["returning"] extends ReturningClause<Models, M>
        ? Readonly<{
              [C in P["returning"][number]]: ColumnType<Models, M, C>;
          }>[]
        : number;
