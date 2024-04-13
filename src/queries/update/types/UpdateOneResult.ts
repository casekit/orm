import { ModelDefinitions } from "../../../schema/types/definitions/ModelDefinitions";
import { ColumnType } from "../../../schema/types/helpers/ColumnType";
import { ModelName } from "../../../schema/types/helpers/ModelName";
import { ReturningClause } from "../../clauses/ReturningClause";
import { UpdateParams } from "./UpdateParams";

export type UpdateOneResult<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
    P extends UpdateParams<Models, M>,
> =
    P["returning"] extends ReturningClause<Models, M>
        ? Readonly<{
              [C in P["returning"][number]]: ColumnType<Models, M, C>;
          }>
        : number;
