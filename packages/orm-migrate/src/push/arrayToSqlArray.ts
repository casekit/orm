export const arrayToSqlArray = (values: unknown[]): string => {
    const joined = values
        .map((v) => (Array.isArray(v) ? arrayToSqlArray(v) : JSON.stringify(v)))
        .join(", ");
    return `{ ${joined} }`;
};
