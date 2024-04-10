import { ModelDefinitions } from "../../definitions/ModelDefinitions";
import { ColumnType } from "../ColumnType";
import { ModelName } from "../ModelName";
import { CreateManyParams } from "./CreateManyParams";
import { CreateOneParams } from "./CreateOneParams";
import { SelectClause } from "./SelectClause";

export type CreateOneResult<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
    P extends CreateOneParams<Models, M> | CreateManyParams<Models, M>,
> =
    P["returning"] extends SelectClause<Models, M>
        ? Readonly<{
              [C in P["returning"][number]]: ColumnType<Models, M, C>;
          }>
        : number;
