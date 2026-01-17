import { orderBy } from "es-toolkit";

import { Orm } from "@casekit/orm";

import { type Column, getColumns } from "./pull/getColumns.js";
import { type ForeignKey, getForeignKeys } from "./pull/getForeignKeys.js";
import { type PrimaryKey, getPrimaryKeys } from "./pull/getPrimaryKeys.js";
import {
    type UniqueConstraint,
    getUniqueConstraints,
} from "./pull/getUniqueConstraints.js";
import { pullDefault } from "./pull/pullDefault.js";

export type Table = {
    schema: string;
    name: string;
    columns: Column[];
    foreignKeys: ForeignKey[];
    primaryKey: PrimaryKey | null;
    uniqueConstraints: UniqueConstraint[];
};

export const pull = async (db: Orm, schemas: string[]): Promise<Table[]> => {
    const [columns, foreignKeys, primaryKeys, uniqueConstraints] =
        await Promise.all([
            db.query(getColumns(schemas)),
            db.query(getForeignKeys(schemas)),
            db.query(getPrimaryKeys(schemas)),
            db.query(getUniqueConstraints(schemas)),
        ]);

    const tablesMap = new Map<string, Table>();

    for (const column of orderBy(columns, ["ordinalPosition"], ["asc"])) {
        const key = `${column.schema}.${column.table}`;
        if (!tablesMap.has(key)) {
            tablesMap.set(key, {
                schema: column.schema,
                name: column.table,
                columns: [],
                foreignKeys: [],
                primaryKey: null,
                uniqueConstraints: [],
            });
        }

        // Normalize the default value using pullDefault
        const normalizedColumn = {
            ...column,
            default: pullDefault(column.default),
        };

        tablesMap.get(key)!.columns.push(normalizedColumn);
    }

    for (const fk of foreignKeys) {
        const key = `${fk.schema}.${fk.tableFrom}`;
        const table = tablesMap.get(key);
        if (table) {
            table.foreignKeys.push(fk);
        }
    }

    for (const pk of primaryKeys) {
        const key = `${pk.schema}.${pk.table}`;
        const table = tablesMap.get(key);
        if (table) {
            table.primaryKey = pk;
        }
    }

    for (const uc of uniqueConstraints) {
        const key = `${uc.schema}.${uc.table}`;
        const table = tablesMap.get(key);
        if (table) {
            table.uniqueConstraints.push(uc);
        }
    }

    return orderBy(
        Array.from(tablesMap.values()),
        ["schema", "name"],
        ["asc", "asc"],
    );
};
