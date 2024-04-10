import { ModelDefinitions } from "../../definitions/ModelDefinitions";
import { ColumnType } from "../ColumnType";
import { ModelName } from "../ModelName";
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
