export type ScalarDataType =
    | "bigint"
    | "bigserial"
    | `bit(${number})`
    | `bit varying(${number})`
    | "boolean"
    | "box"
    | "bytea"
    | `character(${number})`
    | `character varying(${number})`
    | "cidr"
    | "circle"
    | "date"
    | "double precision"
    | "inet"
    | "integer"
    | "interval"
    | "json"
    | "jsonb"
    | "line"
    | "lseg"
    | "macaddr"
    | "macaddr8"
    | "money"
    | `numeric(${number}, ${number})`
    | "path"
    | "pg_lsn"
    | "pg_snapshot"
    | "point"
    | "polygon"
    | "real"
    | "smallint"
    | "smallserial"
    | "serial"
    | "text"
    | "time"
    | `time (${number})`
    | `time (${number}) without timezone`
    | `time with timezone`
    | `time (${number}) with timezone`
    | "timestamp"
    | `timestamp (${number})`
    | `timestamp (${number}) without timezone`
    | `timestamp with timezone`
    | `timestamp (${number}) with timezone`
    | "tsquery"
    | "tsvector"
    | "txid_snapshot"
    | "uuid"
    | "xml";

export type ArrayDataType =
    | `${ScalarDataType}[${number | ""}]`
    | `${ScalarDataType}[${number | ""}][${number | ""}]`
    | `${ScalarDataType}[${number | ""}][${number | ""}][${number | ""}]`
    | `${ScalarDataType}[${number | ""}][${number | ""}][${number | ""}][${
          | number
          | ""}]`
    | `${ScalarDataType}[${number | ""}][${number | ""}][${number | ""}][${
          | number
          | ""}][${number | ""}]`;

export type DataType = ScalarDataType | ArrayDataType;
