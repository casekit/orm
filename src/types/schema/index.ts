import { z } from "zod";

import { SQLStatement } from "../..";
import { Config } from "../Config";
import { ForeignKey } from "./definition/ForeignKey";
import { ModelDefinitions } from "./definition/ModelDefinitions";
import { RelationsDefinitions } from "./definition/RelationsDefinitions";
import { UniqueConstraint } from "./definition/UniqueConstraint";
import { DataType } from "./postgres/DataType";

export type BaseColumn = {
    name: string;
    type: Column["type"];
    schema: z.ZodType<unknown>;
    nullable: boolean;
    default?: unknown;
};

export type BaseModel = {
    table: string;
    schema: string;
    primaryKey: string[];
    uniqueConstraints: UniqueConstraint[];
    foreignKeys: ForeignKey[];
    columns: Record<string, BaseColumn>;
};

export type BaseModels = Record<string, BaseModel>;

export type BaseConfiguration = {
    models: BaseModels;
    relations: BaseRelations;
    extensions: string[];
    config: Config;
};

export type BaseRelations = RelationsDefinitions<ModelDefinitions>;

/**
 * These types are derived from the ModelDefinition and ColumnDefinition types,
 * and are used in the runtime schema representation. Where the *Definition
 * types are optimised for user input and configuration, leave many fields
 * optional and allow multiple ways of specifying the same thing, these types
 * populate the defaults and normalise the configuration.
 */
export type Model<
    Columns extends Record<string, Column> = Record<string, Column>,
> = {
    table: string;
    schema: string;
    columns: Columns;
    primaryKey: string[];
    uniqueConstraints: UniqueConstraint[];
    foreignKeys: ForeignKey[];
};

export type Column<ColumnType = unknown> = {
    name: string;
    type: DataType;
    schema: z.ZodType<ColumnType>;
    nullable: boolean;
    default?: ColumnType | SQLStatement | null;
};
export type Schema = {
    models: Record<string, Model>;
    extensions: string[];
    config: Config;
};
