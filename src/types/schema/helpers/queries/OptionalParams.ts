import { ModelDefinitions } from "../../definitions/ModelDefinitions";
import { ColumnType } from "../ColumnType";
import { ModelName } from "../ModelName";
import { OptionalColumn } from "./OptionalColumn";

export type OptionalParams<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
> =
    OptionalColumn<Models, M> extends never
        ? unknown
        : {
              [C in OptionalColumn<Models, M>]?: ColumnType<Models, M, C>;
          };
