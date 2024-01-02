import { DeepRequired } from "../util/DeepRequired";
import { ColumnDefinition } from "./definition/ColumnDefinition";
import { ModelDefinition } from "./definition/ModelDefinition";
import { SchemaDefinition } from "./definition/SchemaDefinition";

export type Schema = DeepRequired<SchemaDefinition>;
export type Model = DeepRequired<ModelDefinition>;
export type Column = DeepRequired<ColumnDefinition>;
