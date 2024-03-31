import { snakeCase } from "lodash-es";
import { z } from "zod";

import { SQLStatement } from "../..";
import { Config } from "../Config";
import { ColumnDefinition } from "./definition/ColumnDefinition";
import { ForeignKey } from "./definition/ForeignKey";
import { ModelDefinition } from "./definition/ModelDefinition";
import { UniqueConstraint } from "./definition/UniqueConstraint";
import { DataType } from "./postgres/DataType";

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
