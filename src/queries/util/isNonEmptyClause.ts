export const isNonEmptyClause = <T>(clause: T): clause is NonNullable<T> => {
    if (clause === null || clause === undefined) return false;
    switch (typeof clause) {
        case "object":
            return (
                clause !== null &&
                (Object.keys(clause).length > 0 ||
                    Object.getOwnPropertySymbols(clause).length > 0)
            );
        case "string":
            return clause.trim() !== "";
        case "number":
            return clause !== 0;
        default:
            return true;
    }
};
