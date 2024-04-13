export const hasConditions = <T>(clause: T): clause is NonNullable<T> => {
    if (clause === null || clause === undefined) return false;
    switch (typeof clause) {
        case "object": {
            const keys = [
                ...Object.keys(clause),
                ...Object.getOwnPropertySymbols(clause),
            ];
            return keys.length > 0;
        }
        default:
            return false;
    }
};
