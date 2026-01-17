export const isNumeric = (value: string): boolean => {
    return /^-?\d+(\.\d+)?$/.test(value);
};

export const renderDefaultValue = (type: string, d: string | null) => {
    if (d === null) {
        return null;
    } else if (type === "bigint" && isNumeric(d)) {
        return `"${d.replace(/^'(.*)'::bigint$/, "$1")}"`;
    } else if (isNumeric(d)) {
        return d;
    } else if (d.toLowerCase() === "true") {
        return true;
    } else if (d.toLowerCase() === "false") {
        return false;
    } else if (/^'.*'$/.test(d)) {
        return `"${d.replace(/^'(.*)'$/, "$1")}"`;
    } else if (/NULL::.*/.test(d)) {
        return null;
    } else if (/'.*'::text$/.test(d)) {
        return d.replace(/^'(.*)'::text$/, '"$1"');
    } else if (/'.*'::numeric/.test(d)) {
        return d.replace(/^'(.*)'::numeric$/, "$1");
    } else if (/.*::numeric$/.test(d)) {
        return d.replace(/^(.*)::numeric$/, "$1");
    } else {
        return `sql\`${d}\``;
    }
};

export const renderDefault = (type: string, d: string | null) => {
    if (type.endsWith("SERIAL")) return "";
    const value = renderDefaultValue(type, d);
    if (value === null) return "";
    return `default: ${value},`;
};
