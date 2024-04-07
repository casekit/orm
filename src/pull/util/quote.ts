import { unquote } from "./unquote";

export const quote = (s: string) => {
    // we unquote the string first to avoid
    // double quoting
    return JSON.stringify(unquote(s));
};
