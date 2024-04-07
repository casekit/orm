import { ModelDefinitions } from "../schema/definitions/ModelDefinitions";
import { ColumnType } from "../schema/helpers/ColumnType";
import { ModelName } from "../schema/helpers/ModelName";
import { CreateParams } from "./CreateParams";
import { SelectClause } from "./SelectClause";

export type CreateResult<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
    P extends CreateParams<Models, M>,
> =
    P["returning"] extends SelectClause<Models, M>
        ? Readonly<{
              [C in P["returning"][number]]: ColumnType<Models, M, C>;
          }>
        : boolean;
