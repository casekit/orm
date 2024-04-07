import { Orm } from "../../orm";
import { ModelDefinitions } from "../schema/definitions/ModelDefinitions";
import { RelationsDefinitions } from "../schema/definitions/RelationsDefinitions";

export type BaseOrm = Orm<
    ModelDefinitions,
    RelationsDefinitions<ModelDefinitions>
>;
