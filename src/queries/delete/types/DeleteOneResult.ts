import { ModelDefinitions } from "../../../schema/types/definitions/ModelDefinitions";
import { ColumnType } from "../../../schema/types/helpers/ColumnType";
import { ModelName } from "../../../schema/types/helpers/ModelName";
import { ReturningClause } from "../../clauses/ReturningClause";
import { DeleteParams } from "./DeleteParams";

export type DeleteOneResult<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
    P extends DeleteParams<Models, M>,
> =
    P["returning"] extends ReturningClause<Models, M>
        ? Readonly<{
              [C in P["returning"][number]]: ColumnType<Models, M, C>;
          }>
        : number;
