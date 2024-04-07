import { ModelName } from "../helpers/ModelName";
import { ModelDefinitions } from "./ModelDefinitions";
import { ManyToManyRelation } from "./relations/ManyToManyRelation";
import { ManyToOneRelation } from "./relations/ManyToOneRelation";
import { OneToManyRelation } from "./relations/OneToManyRelation";

export type RelationDefinition<
    Models extends ModelDefinitions,
    M extends ModelName<Models>,
> =
    | OneToManyRelation<Models>
    | ManyToOneRelation<Models, M>
    | ManyToManyRelation<Models>;
