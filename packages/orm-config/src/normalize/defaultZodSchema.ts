import { z } from "zod";

/**
 * WARNING!!! The schemas in this file must be kept in sync
 * with DefaultFieldType in packages/orm-schema/src/helper/DefaultFieldType.ts.
 * If you make a change here, make sure to update the
 * corresponding type.
 */
export const defaultZodSchema = (type: string): z.ZodType => {
    if (type.endsWith("[]"))
        return z.array(defaultZodSchema(type.slice(0, -2)));
    if (type.startsWith("bit ")) return z.string();
    if (type.startsWith("bit(")) return z.string();
    if (type.startsWith("character varying")) return z.string();
    if (type.startsWith("character")) return z.string();
    if (type.startsWith("numeric ")) return z.string();
    if (type.startsWith("numeric(")) return z.string();
    if (type.startsWith("timestamp ")) return z.date();
    if (type.startsWith("timestamp(")) return z.date();
    if (type.startsWith("time ")) return z.string();
    if (type.startsWith("time(")) return z.string();
    if (type.startsWith("varchar ")) return z.string();
    if (type.startsWith("varchar(")) return z.string();
    // if (type.startsWith("interval"))
    //     return z.object({
    //         years: z.number().optional(),
    //         months: z.number().optional(),
    //         days: z.number().optional(),
    //         hours: z.number().optional(),
    //         minutes: z.number().optional(),
    //         seconds: z.number().optional(),
    //         milliseconds: z.number().optional(),
    //     });

    switch (type) {
        case "bigint":
        case "bigserial":
            return z.coerce.bigint();
        case "decimal":
        case "double precision":
        case "integer":
        case "oid":
        case "real":
        case "smallint":
        case "smallserial":
        case "serial":
            return z.number();
        case "bpchar":
        case "bit":
        case "box":
        case "cidr":
        case "daterange":
        case "inet":
        case "int4range":
        case "int8range":
        case "int2vector":
        case "pg_lsn":
        case "regclass":
        case "regconfig":
        case "regdictionary":
        case "regnamespace":
        case "regoper":
        case "regoperator":
        case "regproc":
        case "regprocedure":
        case "regrole":
        case "regtype":
        case "tid":
        case "xid":
        case "numrange":
        case "tsrange":
        case "tstzrange":
        case "line":
        case "lseg":
        case "macaddr":
        case "macaddr8":
        case "money":
        case "numeric":
        case "path":
        case "polygon":
        case "text":
        case "time":
        case "timetz":
        case "tsquery":
        case "tsvector":
        case "txid_snapshot":
        case "varchar":
        case "char":
        case "xml":
            return z.string();
        case "bytea":
            return z.instanceof(Buffer);
        // case "circle":
        //     return z.object({
        //         x: z.number(),
        //         y: z.number(),
        //         radius: z.number(),
        //     });
        // case "point":
        //     return z.object({ x: z.number(), y: z.number() });
        case "json":
        case "jsonb":
            return z.record(z.string(), z.any());
        case "uuid":
            return z.uuid();
        case "boolean":
            return z.boolean();
        case "date":
        case "timestamp":
        case "timestamptz":
            return z.date();
        default:
            throw new Error(
                "Unsupported type: " +
                    type +
                    " - please specify a zod schema in the field definition",
            );
    }
};
