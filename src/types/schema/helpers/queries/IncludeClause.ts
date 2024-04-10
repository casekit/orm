import { ModelDefinitions } from "../../definitions/ModelDefinitions";
import { RelationsDefinitions } from "../../definitions/RelationsDefinitions";
import { ModelName } from "../ModelName";
import { FindManyQuery } from "./FindManyQuery";
import { FindOneQuery } from "./FindOneQuery";

export type IncludeClause<
    Models extends ModelDefinitions,
    Relations extends RelationsDefinitions<Models>,
    M extends ModelName<Models>,
> = {
    [R in Extract<keyof Relations[M], string>]?: Relations[M][R] extends {
        model: ModelName<Models>;
    }
        ? Relations[M][R] extends { type: "N:1" }
            ? FindOneQuery<Models, Relations, Relations[M][R]["model"]>
            : Relations[M][R] extends { type: "1:N" }
              ? FindManyQuery<Models, Relations, Relations[M][R]["model"]>
              : Relations[M][R] extends { type: "N:N" }
                ? FindManyQuery<Models, Relations, Relations[M][R]["model"]>
                : never
        : never;
};
