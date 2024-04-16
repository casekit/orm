import { Connection } from "../../../Connection";
import { Middleware } from "../../../queries/middleware/Middleware";
import { BaseModels } from "./BaseModels";
import { BaseRelations } from "./BaseRelations";

export type BaseConfiguration = {
    models: BaseModels;
    relations: BaseRelations;
    extensions: string[];
    naming: { column: (s: string) => string; table: (s: string) => string };
    schema: string;
    connection: Connection;
    middleware: Middleware;
};
