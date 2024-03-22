import { z } from "zod";
import { DataType } from "~/types/schema/postgres/DataType";

/**
 * TODO figure out if these are reasonable or if there are better
 * alternatives - and what the values should be for the other datatypes
 */
export const suggestedColumnSchema = (type: DataType) => {
    if (type.startsWith("character")) return z.string();
    if (type.startsWith("numeric")) return z.number();
    if (type.startsWith("timestamp")) return z.date();

    switch (type) {
        case "bigint":
        case "bigserial":
        case "double precision":
        case "integer":
        case "real":
        case "smallint":
        case "smallserial":
        case "serial":
            // sometimes (bigints) are returned as strings,
            // so we coerce them here. if your application
            // needs to deal with bigints larger than javascript's
            // max int, you can specify your own schema instead
            return z.coerce.number();
        case "inet":
        case "json":
        case "jsonb":
        case "money":
        case "text":
        case "uuid":
            return z.string();
        default:
            return z.unknown();
    }
};
