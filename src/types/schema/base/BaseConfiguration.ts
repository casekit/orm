import { Config } from "../../Config";
import { BaseModels } from "./BaseModels";
import { BaseRelations } from "./BaseRelations";

export type BaseConfiguration = {
    models: BaseModels;
    relations: BaseRelations;
    extensions: string[];
    config: Config;
};
