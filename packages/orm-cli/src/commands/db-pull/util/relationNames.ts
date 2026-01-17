import {
    camelCase,
    lowerFirst,
    pascalCase,
    upperFirst,
} from "es-toolkit/string";
import pluralize from "pluralize";

import type { ForeignKey } from "@casekit/orm-migrate";

export const guessManyToOneRelationName = (fk: ForeignKey): string => {
    return lowerFirst(
        fk.columnsFrom.map((c) => pascalCase(c).replace(/Id$/, "")).join(""),
    );
};

export const guessOneToManyRelationName = (fk: ForeignKey): string => {
    const foreignName = lowerFirst(
        fk.columnsFrom.map((c) => pascalCase(c).replace(/Id$/, "")).join(""),
    );

    const tableTo = camelCase(pluralize.singular(fk.tableTo));
    const tableFrom = camelCase(pluralize.plural(fk.tableFrom));

    if (tableTo === foreignName) {
        return pluralize.plural(tableFrom);
    }

    return `${foreignName}${upperFirst(pluralize.plural(tableFrom))}`;
};
