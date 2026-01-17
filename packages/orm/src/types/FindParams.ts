import {
    ModelDefinitions,
    ModelName,
    OperatorDefinitions,
} from "@casekit/orm-schema";

import { IncludeClause } from "./IncludeClause.js";
import { OrderByClause } from "./OrderByClause.js";
import { SelectClause } from "./SelectClause.js";
import { WhereClause } from "./WhereClause.js";

/**
 * We have a single FindParams type rather than a FindOneParams and FindManyParams type
 * even though it's a bit annoying as it allows you to (incorrectly) specify
 * a limit, offset, and order by in a findOne query. We do this because choosing between
 * the two different types (which we did originally) in a nested include clause makes our
 * types around TEN TIMES as slow for a deeply nested query - and dramatically limits the
 * depth of nesting possible in a query too. It's just not worth it.
 */
export interface FindParams<
    Models extends ModelDefinitions,
    Operators extends OperatorDefinitions,
    M extends ModelName<Models>,
> {
    select: SelectClause<Models[M]>;
    include?: IncludeClause<Models, Operators, M>;
    where?: WhereClause<Models, Operators, M>;
    for?: "update" | "no key update" | "share" | "key share";
    limit?: number;
    offset?: number;
    orderBy?: OrderByClause<Models, M>;
}
