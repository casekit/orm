import type { Column } from "@casekit/orm-migrate";

/**
 * Renders PostgreSQL column types for code generation
 * Handles array types, SERIAL types, and passes through all other types unchanged
 */
export const renderType = (column: Column): string => {
    // Handle SERIAL columns first
    if (column.isSerial) {
        if (column.type === "smallint") {
            return "smallserial";
        } else if (column.type === "integer") {
            return "serial";
        } else if (column.type === "bigint") {
            return "bigserial";
        }
    }

    // Handle array types
    if (column.type === "ARRAY" && column.elementType) {
        return `${column.elementType}${"[]".repeat(column.cardinality ?? 1)}`;
    }

    // Handle PostgreSQL array shortcuts (e.g., _text, _int4)
    // These are internal representations for array types
    const arrayShortcuts: Record<string, string> = {
        _text: "text[]",
        _varchar: "varchar[]",
        _int4: "integer[]",
        _int8: "bigint[]",
        _int2: "smallint[]",
        _float4: "real[]",
        _float8: "double precision[]",
        _bool: "boolean[]",
        _uuid: "uuid[]",
        _json: "json[]",
        _jsonb: "jsonb[]",
        _bytea: "bytea[]",
        _date: "date[]",
        _timestamp: "timestamp[]",
        _timestamptz: "timestamptz[]",
        _time: "time[]",
        _timetz: "timetz[]",
        _numeric: "numeric[]",
        _money: "money[]",
        _inet: "inet[]",
        _cidr: "cidr[]",
        _macaddr: "macaddr[]",
        _macaddr8: "macaddr8[]",
    };

    const shortcut = arrayShortcuts[column.type];
    if (shortcut) {
        return shortcut;
    }

    // Pass through all other types unchanged
    return column.type;
};
