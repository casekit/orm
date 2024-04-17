import { ModelName } from "../helpers/ModelName";
import { ManyToManyRelation } from "../relations/ManyToManyRelation";
import { ManyToOneRelation } from "../relations/ManyToOneRelation";
import { OneToManyRelation } from "../relations/OneToManyRelation";
import { ModelDefinitions } from "./ModelDefinitions";

export type RelationDefinition<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
> =
    | OneToManyRelation<Models>
    | ManyToOneRelation<Models, M>
    | ManyToManyRelation<Models>;
