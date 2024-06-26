import { ColumnType } from "../../../schema/types/helpers/ColumnType";
import { ModelName } from "../../../schema/types/helpers/ModelName";
import { LooseModelDefinitions } from "../../../schema/types/loose/LooseModelDefinitions";
import { SelectClause } from "../../clauses/SelectClause";
import { CreateManyParams } from "./CreateManyParams";
import { CreateOneParams } from "./CreateOneParams";

export type CreateOneResult<
    Models extends LooseModelDefinitions,
    M extends ModelName<Models>,
    P extends CreateOneParams<Models, M> | CreateManyParams<Models, M>,
> =
    P["returning"] extends SelectClause<Models[M]>
        ? Readonly<{
              [C in P["returning"][number]]: ColumnType<Models, M, C>;
          }>
        : number;
