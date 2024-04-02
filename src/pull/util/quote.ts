export const quote = (s: string) => {
    // if we're given an already quoted string,
    // strip the quotes and re-quote it.
    // this is needed because postgres returns column or table
    // names that use reserved words in quotes.
    if (s.startsWith('"') && s.endsWith('"')) {
        return JSON.stringify(s.substring(1, s.length - 1));
    } else {
        return JSON.stringify(s);
    }
};
