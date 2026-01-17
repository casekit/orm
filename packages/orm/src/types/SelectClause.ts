import { NonEmptyArray } from "ts-essentials";

import { FieldName, ModelDefinition } from "@casekit/orm-schema";

export type SelectClause<Model extends ModelDefinition> = NonEmptyArray<
    FieldName<Model>
>;
