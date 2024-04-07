import { camelCase } from "lodash-es";

import { ForeignKey } from "../types/ForeignKey";
import { format } from "../util/format";

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
        return fk.tableFrom + "_" + fk.columnsFrom.join("_");
    } else {
        return camelCase(fk.tableFrom + "s");
    }
};

export const renderRelations = async (def: Definition) => {
    const manyToOne = (def.foreignKeys[def.table] ?? []).map(
        (fk) =>
            `${guessManyToOneRelationName(fk)}:` +
            JSON.stringify({
                table: camelCase(fk.tableTo),
                type: "N:1",
                foreignKey:
                    fk.columnsFrom.length === 1
                        ? fk.columnsFrom[0]
                        : fk.columnsFrom,
            }),
    );

    const oneToMany = Object.entries(def.foreignKeys).flatMap(([table, fks]) =>
        fks
            .filter((fk) => fk.tableTo === def.table)
            .map(
                (fk) =>
                    `${guessOneToManyRelationName(fk)}:` +
                    JSON.stringify({
                        table: camelCase(table),
                        type: "1:N",
                        foreignKey:
                            fk.columnsFrom.length === 1
                                ? fk.columnsFrom[0]
                                : fk.columnsFrom,
                    }),
            ),
    );

    return await format(`
        import { RelationsDefinition } from "@casekit/orm";
        import { type Models } from "../models";

        export const ${camelCase(def.table)} = {
            ${manyToOne.map((rel) => rel).join(",\n")},
            ${oneToMany.map((rel) => rel).join(",\n")}
        } satisfies RelationsDefinition;`);
};
