/**
 * Normalizes PostgreSQL default values to their canonical forms
 * This is the inverse of renderDefault - it takes raw PostgreSQL defaults
 * and converts them back to standard representations.
 */
export const pullDefault = (defaultValue: string | null): string | null => {
    if (defaultValue === null) {
        return null;
    }

    // Only convert when the default is literally "now()" - not timestamp literals
    if (defaultValue === "now()") {
        return "now()";
    }

    // Handle other common SQL functions that should remain as function calls
    if (
        /^(gen_random_uuid|uuid_generate_v\d+|current_timestamp|current_date|current_time)\(\)$/.test(
            defaultValue,
        )
    ) {
        return defaultValue;
    }

    // Handle nextval sequences (for serial types) - keep as-is
    if (/^nextval\('.*'::regclass\)$/.test(defaultValue)) {
        return defaultValue;
    }

    // Handle simple literals without type casting
    if (/^'(.*)'::(text|varchar|char|bpchar)$/.test(defaultValue)) {
        return defaultValue.replace(
            /^'(.*)'::(text|varchar|char|bpchar)$/,
            "'$1'",
        );
    }

    // Handle numeric literals with type casting
    if (
        /^'(.*)'::(numeric|decimal|real|double precision|float\d*|int\d*|smallint|bigint|integer)$/.test(
            defaultValue,
        )
    ) {
        return defaultValue.replace(
            /^'(.*)'::(numeric|decimal|real|double precision|float\d*|int\d*|smallint|bigint|integer)$/,
            "$1",
        );
    }

    // Handle boolean literals
    if (defaultValue === "true" || defaultValue === "false") {
        return defaultValue;
    }

    // Handle NULL with type casting
    if (/^NULL::.+$/.test(defaultValue)) {
        return null;
    }

    // Handle array literals - keep as-is since they're complex
    if (/^(ARRAY\[.*\]|\{.*\})/.test(defaultValue)) {
        return defaultValue;
    }

    // For everything else, return as-is
    return defaultValue;
};
