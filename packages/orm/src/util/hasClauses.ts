export const hasClauses = <T>(clause: T): clause is NonNullable<T> => {
    if (clause === null || clause === undefined || typeof clause !== "object")
        return false;

    const keys = [
        ...Object.keys(clause),
        ...Object.getOwnPropertySymbols(clause),
    ];
    return keys.length > 0;
};
