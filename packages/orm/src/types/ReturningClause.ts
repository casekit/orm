import { AnyNonEmptyArray } from "ts-essentials";

import { FieldName, ModelDefinition } from "@casekit/orm-schema";

export type ReturningClause<Model extends ModelDefinition> = AnyNonEmptyArray<
    FieldName<Model>
>;
