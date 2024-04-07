export const unquote = (s: string) => {
    // if we're given an quoted string,
    // strip the quotes
    if (s.startsWith('"') && s.endsWith('"')) {
        return s.substring(1, s.length - 1);
    } else {
        return s;
    }
};
