import { Config } from "../Config";
import { DeepRequired } from "../util/DeepRequired";
import { ColumnDefinition } from "./definition/ColumnDefinition";
import { ModelDefinition } from "./definition/ModelDefinition";

export type Model = DeepRequired<ModelDefinition>;
export type Column = DeepRequired<ColumnDefinition>;
export type Schema = { models: Record<string, Model>; config: Config };
