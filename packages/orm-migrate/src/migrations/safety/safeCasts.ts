/**
 * Determines whether a PostgreSQL column type change is safe,
 * meaning it will NOT cause a full table rewrite.
 *
 * Safe casts include:
 * - varchar(n) -> varchar(m) where m > n
 * - varchar(n) -> text
 * - char(n) -> char(m) where m > n
 * - int -> bigint
 * - smallint -> int
 * - smallint -> bigint
 * - numeric(a,b) -> numeric(c,d) where c >= a and d >= b
 * - cidr -> inet
 */
export const isSafeCast = (from: string, to: string): boolean => {
    const normFrom = normalise(from);
    const normTo = normalise(to);

    if (normFrom === normTo) return true;

    // varchar(n) -> text
    if (isVarchar(normFrom) && normTo === "text") return true;

    // varchar(n) -> varchar(m) where m > n
    if (isVarchar(normFrom) && isVarchar(normTo)) {
        const fromSize = extractSize(normFrom);
        const toSize = extractSize(normTo);
        if (fromSize !== null && toSize !== null && toSize > fromSize) {
            return true;
        }
        // varchar(n) -> varchar (unlimited)
        if (fromSize !== null && toSize === null) return true;
    }

    // char(n) -> char(m) where m > n
    if (isChar(normFrom) && isChar(normTo)) {
        const fromSize = extractSize(normFrom);
        const toSize = extractSize(normTo);
        if (fromSize !== null && toSize !== null && toSize > fromSize) {
            return true;
        }
    }

    // Integer widening
    if (
        normFrom === "smallint" &&
        (normTo === "integer" || normTo === "bigint")
    )
        return true;
    if (normFrom === "integer" && normTo === "bigint") return true;

    // Numeric precision increase
    if (isNumeric(normFrom) && isNumeric(normTo)) {
        const fromParts = extractNumericPrecision(normFrom);
        const toParts = extractNumericPrecision(normTo);
        if (fromParts && toParts) {
            if (
                toParts.precision >= fromParts.precision &&
                toParts.scale >= fromParts.scale
            ) {
                return true;
            }
        }
        // numeric(p,s) -> numeric (unlimited)
        if (fromParts && !toParts && normTo === "numeric") return true;
    }

    // cidr -> inet
    if (normFrom === "cidr" && normTo === "inet") return true;

    return false;
};

const normalise = (type: string): string => {
    const t = type.toLowerCase().trim();
    // Normalise common aliases
    if (t === "int" || t === "int4") return "integer";
    if (t === "int2") return "smallint";
    if (t === "int8") return "bigint";
    if (t === "float4") return "real";
    if (t === "float8") return "double precision";
    if (t === "bool") return "boolean";
    if (t.startsWith("character varying"))
        return t.replace("character varying", "varchar");
    if (t === "character" || t === "bpchar") return "char";
    if (t === "decimal") return "numeric";
    return t;
};

const isVarchar = (type: string): boolean =>
    type === "varchar" || type.startsWith("varchar(");

const isChar = (type: string): boolean =>
    type === "char" || type.startsWith("char(");

const isNumeric = (type: string): boolean =>
    type === "numeric" || type.startsWith("numeric(");

const extractSize = (type: string): number | null => {
    const match = /\((\d+)\)/.exec(type);
    return match ? parseInt(match[1]!, 10) : null;
};

const extractNumericPrecision = (
    type: string,
): { precision: number; scale: number } | null => {
    const match = /\((\d+),\s*(\d+)\)/.exec(type);
    if (!match) return null;
    return {
        precision: parseInt(match[1]!, 10),
        scale: parseInt(match[2]!, 10),
    };
};
