export const makeTableAlias = (index: number): string => {
    let result = "";
    let curr = index;
    do {
        const remainder = curr % 26;
        result = String.fromCharCode("a".charCodeAt(0) + remainder) + result;
        curr = (curr - remainder) / 26 - 1;
    } while (curr >= 0);
    return result;
};
