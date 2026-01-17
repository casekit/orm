import { Logger } from "@casekit/orm-schema";

/**
 * This needs a lot of work, but leaving as it is for now.
 */
const log = (f: (...args: unknown[]) => void, args: unknown[]) => {
    for (const arg of args) {
        if (arg === null || arg === undefined) continue;

        if (arg instanceof Error) {
            f(arg);
        } else if (typeof arg === "object") {
            for (const k of Object.getOwnPropertyNames(arg)) {
                f(`${k}: ${(arg as Record<string, unknown>)[k]}`);
            }
        } else {
            f(arg);
        }
    }
};

export const defaultLogger: Logger = {
    debug(...args: unknown[]) {
        log(console.debug, args);
    },
    info(...args: unknown[]) {
        log(console.info, args);
    },
    warn(...args: unknown[]) {
        log(console.warn, args);
    },
    error(...args: unknown[]) {
        log(console.error, args);
    },
};
