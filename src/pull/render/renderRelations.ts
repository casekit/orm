import { camelCase, upperFirst } from "lodash-es";
import pluralize from "pluralize";

import { ForeignKey } from "../types/ForeignKey";
import { format } from "../util/format";
import { unquote } from "../util/unquote";

type Definition = {
    table: string;
    foreignKeys: Record<string, ForeignKey[]>;
};

const guessManyToOneRelationName = (fk: ForeignKey) => {
    if (fk.columnsFrom.length > 1) {
        return camelCase(fk.columnsFrom.join("_"));
    } else {
        return camelCase(fk.columnsFrom[0]).replace(/Id$/, "");
    }
};

const guessOneToManyRelationName = (fk: ForeignKey) => {
    if (fk.columnsFrom.length > 1) {
        return camelCase(fk.columnsFrom.join("_") + "_" + fk.tableFrom);
    } else {
        return camelCase(
            upperFirst(camelCase(fk.columnsFrom[0]).replace(/Id$/, "")) +
                " " +
                pluralize(fk.tableFrom),
        );
    }
};

export const renderRelations = async (def: Definition) => {
    const manyToOne = (def.foreignKeys[def.table] ?? []).map(
        (fk) =>
            `${guessManyToOneRelationName(fk)}:` +
            JSON.stringify({
                model: camelCase(fk.tableTo),
                type: "N:1",
                foreignKey:
                    fk.columnsFrom.length === 1
                        ? camelCase(fk.columnsFrom[0])
                        : fk.columnsFrom.map(camelCase),
            }),
    );

    const oneToMany = Object.entries(def.foreignKeys).flatMap(([table, fks]) =>
        fks
            .filter((fk) => unquote(fk.tableTo) === unquote(def.table))
            .map(
                (fk) =>
                    `${guessOneToManyRelationName(fk)}:` +
                    JSON.stringify({
                        model: camelCase(table),
                        type: "1:N",
                        foreignKey:
                            fk.columnsFrom.length === 1
                                ? camelCase(fk.columnsFrom[0])
                                : fk.columnsFrom.map(camelCase),
                    }),
            ),
    );

    return await format(`
        import { RelationsDefinition } from "@casekit/orm";
        import { type Models } from "../models";

        export const ${camelCase(def.table)} = {
            ${[...manyToOne, ...oneToMany].map((rel) => rel).join(",\n")}
        } satisfies RelationsDefinition<Models, "${camelCase(def.table)}">;`);
};
