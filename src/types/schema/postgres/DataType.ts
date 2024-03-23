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
    | `time (${number}) without time zone`
    | `time with time zone`
    | `time (${number}) with time zone`
    | "timestamp"
    | `timestamp (${number})`
    | `timestamp (${number}) without time zone`
    | `timestamp with time zone`
    | `timestamp (${number}) with time zone`
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
