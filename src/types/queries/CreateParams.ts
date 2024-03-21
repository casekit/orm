import { z } from "zod";

import { SchemaDefinition } from "../schema/definition/SchemaDefinition";
import { Columns } from "../schema/helpers/Columns";
import { ModelName } from "../schema/helpers/ModelName";
import { SelectClause } from "./SelectClause";

export type OptionalColumns<
    S extends SchemaDefinition,
    M extends ModelName<S>,
> = Exclude<
    {
        [C in keyof Columns<S, M>]: Columns<S, M>[C]["nullable"] extends true
            ? C
            : never;
    }[keyof Columns<S, M>],
    never
>;

export type RequiredColumns<
    S extends SchemaDefinition,
    M extends ModelName<S>,
> = Exclude<keyof Columns<S, M>, OptionalColumns<S, M>>;

export type CreateParams<S extends SchemaDefinition, M extends ModelName<S>> = {
    data: {
        [C in RequiredColumns<S, M>]: z.infer<Columns<S, M>[C]["schema"]>;
    } & {
        [C in OptionalColumns<S, M>]?: z.infer<
            Columns<S, M>[C]["schema"]
        > | null;
    };
    returning?: SelectClause<S, M>;
};
