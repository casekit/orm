import { ModelName } from "../../schema/types/helpers/ModelName";
import { LooseModelDefinitions } from "../../schema/types/loose/LooseModelDefinitions";
import { LooseRelationsDefinitions } from "../../schema/types/loose/LooseRelationsDefinitions";
import { FindManyParams } from "../find/types/FindManyParams";
import { FindOneParams } from "../find/types/FindOneParams";

export type IncludeClause<
    Models extends LooseModelDefinitions,
    Relations extends LooseRelationsDefinitions<Models>,
    M extends ModelName<Models>,
> = {
    [R in Extract<keyof Relations[M], string>]?: Relations[M][R] extends {
        model: ModelName<Models>;
    }
        ? Relations[M][R] extends { type: "N:1" }
            ? FindOneParams<Models, Relations, Relations[M][R]["model"]>
            : Relations[M][R] extends { type: "1:N" }
              ? FindManyParams<Models, Relations, Relations[M][R]["model"]>
              : Relations[M][R] extends { type: "N:N" }
                ? FindManyParams<Models, Relations, Relations[M][R]["model"]>
                : never
        : never;
};
