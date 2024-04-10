import { Orm } from "../../../orm";
import { ModelDefinitions } from "../definitions/ModelDefinitions";
import { RelationsDefinitions } from "../definitions/RelationsDefinitions";

export type BaseOrm = Orm<
    ModelDefinitions,
    RelationsDefinitions<ModelDefinitions>
>;
