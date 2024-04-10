import { ModelDefinitions } from "../../schema/types/definitions/ModelDefinitions";
import { ColumnType } from "../../schema/types/helpers/ColumnType";
import { ModelName } from "../../schema/types/helpers/ModelName";
import { CreateManyParams } from "./CreateManyParams";
import { CreateOneParams } from "./CreateOneParams";
import { SelectClause } from "./SelectClause";

export type CreateManyResult<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
    P extends CreateOneParams<Models, M> | CreateManyParams<Models, M>,
> =
    P["returning"] extends SelectClause<Models, M>
        ? Readonly<{
              [C in P["returning"][number]]: ColumnType<Models, M, C>;
          }>[]
        : number;