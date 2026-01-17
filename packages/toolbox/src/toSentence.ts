export const toSentence = (iter: Iterable<string>, conjunction = "and") => {
    const items = Array.from(iter);
    switch (items.length) {
        case 0:
            return "";
        case 1:
            return items[0];
        case 2:
            return items.join(` ${conjunction} `);
        default:
            return `${items.slice(0, -1).join(", ")}, ${conjunction} ${items[items.length - 1]}`;
    }
};
