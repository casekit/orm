/**
 * WARNING!!! The types in this file must be kept in sync
 * with the zod schemas in packages/orm/src/config/defaultZodSchema.ts.
 * If you make a change here, make sure to update the
 * corresponding zod schema.
 */
export type DefaultFieldType<DataType extends string> =
    DataType extends `${infer T extends string}[]`
        ? DefaultFieldType<T>[]
        : Uppercase<DataType> extends "BIGINT" | "BIGSERIAL"
          ? bigint
          : Uppercase<DataType> extends
                  | "DOUBLE PRECISION"
                  | "INTEGER"
                  | "OID"
                  | "REAL"
                  | "SMALLINT"
                  | "SMALLSERIAL"
                  | "SERIAL"
            ? number
            : Uppercase<DataType> extends
                    | "BPCHAR"
                    | "BIT"
                    | "BOX"
                    | "CIDR"
                    | "CHAR"
                    | "DATERANGE"
                    | "DECIMAL"
                    | "INET"
                    | "INT4RANGE"
                    | "INT8RANGE"
                    | "INT2VECTOR"
                    | "PG_LSN"
                    | "REGCLASS"
                    | "REGCONFIG"
                    | "REGDICTIONARY"
                    | "REGNAMESPACE"
                    | "REGOPER"
                    | "REGOPERATOR"
                    | "REGPROC"
                    | "REGPROCEDURE"
                    | "REGROLE"
                    | "REGTYPE"
                    | "TID"
                    | "XID"
                    | "NUMRANGE"
                    | "TSRANGE"
                    | "TSTZRANGE"
                    | "LINE"
                    | "LSEG"
                    | "MACADDR"
                    | "MACADDR8"
                    | "MONEY"
                    | "PATH"
                    | "POLYGON"
                    | "TEXT"
                    | "TIME"
                    | "TIMETZ"
                    | "TSQUERY"
                    | "TSVECTOR"
                    | "TXID_SNAPSHOT"
                    | "XML"
                    | `BIT${string}`
                    | `CHARACTER${string}`
                    | `NUMERIC${string}`
                    | `TIME ${string}`
                    | `TIME(${string})`
                    | `VARCHAR`
                    | `VARCHAR ${string}`
              ? string
              : Uppercase<DataType> extends "BYTEA"
                ? Buffer
                : // : Uppercase<DataType> extends "CIRCLE"
                  //   ? { x: number; y: number; radius: number }
                  // : Uppercase<DataType> extends "POINT"
                  //   ? { x: number; y: number }
                  Uppercase<DataType> extends "JSON" | "JSONB"
                  ? unknown
                  : Uppercase<DataType> extends "UUID"
                    ? string
                    : Uppercase<DataType> extends "BOOLEAN"
                      ? boolean
                      : Uppercase<DataType> extends
                              | "DATE"
                              | "TIMESTAMP"
                              | "TIMESTAMPTZ"
                              | `TIMESTAMP${string}`
                        ? Date
                        : // : Uppercase<DataType> extends "INTERVAL"
                          //   ? {
                          //         years?: number;
                          //         months?: number;
                          //         days?: number;
                          //         hours?: number;
                          //         minutes?: number;
                          //         seconds?: number;
                          //         milliseconds?: number;
                          //     }
                          unknown;
