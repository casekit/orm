import { ModelName } from "../../schema/types/helpers/ModelName";
import { LooseModelDefinitions } from "../../schema/types/loose/LooseModelDefinitions";
import { LooseRelationsDefinitions } from "../../schema/types/loose/LooseRelationsDefinitions";
import { ColumnName } from "../../types/ColumnName";
import { NonEmptyArray } from "../../types/util/NonEmptyArray";

export type OrderByClause<
    Models extends LooseModelDefinitions,
    Relations extends LooseRelationsDefinitions<Models>,
    M extends ModelName<Models>,
> = NonEmptyArray<
    | OrderByColumn<Models, Relations, M>
    | [OrderByColumn<Models, Relations, M>, "asc" | "desc"]
>;

type OrderByColumn<
    Models extends LooseModelDefinitions,
    Relations extends LooseRelationsDefinitions<Models>,
    M extends ModelName<Models>,
> =
    | ColumnName<Models[M]>
    | {
          [R in Extract<
              keyof Relations[M],
              string
          >]: `${R}.${Relations[M][R] extends { type: "N:1"; model: infer M2 extends ModelName<Models> } ? Extract<keyof Models[M2]["columns"], string> : never}`;
      }[Extract<keyof Relations[M], string>];
