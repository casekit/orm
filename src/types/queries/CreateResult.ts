import { SchemaDefinition } from "../schema/definition/SchemaDefinition";
import { ColumnType } from "../schema/helpers/ColumnType";
import { ModelName } from "../schema/helpers/ModelName";
import { CreateParams } from "./CreateParams";
import { SelectClause } from "./SelectClause";

export type CreateResult<
    S extends SchemaDefinition,
    M extends ModelName<S>,
    P extends CreateParams<S, M>,
> =
    P["returning"] extends SelectClause<S, M>
        ? Readonly<{
              [C in P["returning"][number]]: ColumnType<S, M, C>;
          }>
        : boolean;
