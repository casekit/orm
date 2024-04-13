import { ModelDefinitions } from "../../../schema/types/definitions/ModelDefinitions";
import { ColumnType } from "../../../schema/types/helpers/ColumnType";
import { ModelName } from "../../../schema/types/helpers/ModelName";
import { RequiredColumn } from "./RequiredColumn";

export type RequiredParams<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
> =
    RequiredColumn<Models, M> extends never
        ? unknown
        : {
              [C in RequiredColumn<Models, M>]: ColumnType<Models, M, C>;
          };
