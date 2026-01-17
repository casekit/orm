import { Logger } from "@casekit/orm-schema";

interface LogEntry {
    message: unknown;
    args: unknown[];
}

interface LogEntries {
    debug: LogEntry[];
    info: LogEntry[];
    warn: LogEntry[];
    error: LogEntry[];
}

export interface MockLogger extends Logger {
    get logs(): LogEntries;

    clear(): void;
}

/* v8 ignore start */
export function mockLogger({ silence } = { silence: true }): MockLogger {
    const entries: LogEntries = { debug: [], info: [], warn: [], error: [] };

    return {
        get logs() {
            return entries;
        },

        clear() {
            entries.debug.length = 0;
            entries.info.length = 0;
            entries.warn.length = 0;
            entries.error.length = 0;
        },

        debug(message: string, ...args: unknown[]) {
            if (!silence) {
                console.debug(message, ...args);
            }
            entries.debug.push({ message, args });
        },
        info(message: string, ...args: unknown[]) {
            if (!silence) {
                console.info(message, ...args);
            }
            entries.info.push({ message, args });
        },
        warn(message: string, ...args: unknown[]) {
            if (!silence) {
                console.warn(message, ...args);
            }
            entries.warn.push({ message, args });
        },
        error(message: string, ...args: unknown[]) {
            if (!silence) {
                console.error(message, ...args);
            }
            entries.error.push({ message, args });
        },
    } as MockLogger;
}
/* v8 ignore stop */
