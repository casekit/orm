import { Orm } from "../../../orm";
import { LooseModelDefinitions } from "../loose/LooseModelDefinitions";
import { LooseRelationsDefinitions } from "../loose/LooseRelationsDefinitions";

export type BaseOrm = Orm<
    LooseModelDefinitions,
    LooseRelationsDefinitions<LooseModelDefinitions>
>;
