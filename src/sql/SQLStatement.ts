/**
 * This file is heavily inspired by felixfbecker/node-sql-template-strings,
 * which has the following licence:
 *
 * ISC License
 * Copyright (c) 2016, Felix Frederick Becker
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */
import pgfmt from "pg-format";

export class SQLStatement {
    public fragments: string[];
    public values: unknown[];

    constructor(
        sql: readonly string[] | string = [],
        values: readonly unknown[] = [],
    ) {
        this.fragments = typeof sql === "string" ? [sql] : [...sql];
        this.values = [...values];
    }

    get text() {
        return this.fragments.reduce((prev, curr, i) => prev + "$" + i + curr);
    }

    public push(...args: (SQLStatement | string | null)[]): SQLStatement {
        for (const arg of args) {
            if (arg === null) {
                // do nothing - this case is here as a convenience
                // for when using functions that might not have any
                // SQL to return
            } else if (typeof arg === "string") {
                if (this.fragments.length === 0) {
                    this.fragments.push(arg);
                } else {
                    this.fragments[this.fragments.length - 1] += arg;
                }
            } else {
                if (arg.fragments.length === 0) {
                    // do nothing - statement is empty
                } else if (this.fragments.length === 0) {
                    this.fragments.push(...arg.fragments);
                    this.values.push(...arg.values);
                } else {
                    this.fragments[this.fragments.length - 1] +=
                        arg.fragments[0];
                    this.fragments.push(...arg.fragments.slice(1));
                    this.values.push(...arg.values);
                }
            }
        }
        return this;
    }

    public withIdentifiers(...identifiers: string[]) {
        console.log(this.fragments);
        console.log(this.values);
        const remainingIdentifiers = [...identifiers];
        for (const index of this.fragments.keys()) {
            const countPlaceholders =
                this.fragments[index].match(/%I/g)?.length ?? 0;
            if (countPlaceholders > 0) {
                const interpolated = pgfmt(
                    this.fragments[index],
                    ...remainingIdentifiers.splice(0, countPlaceholders),
                );
                this.fragments[index] = interpolated;
                if (remainingIdentifiers.length === 0) {
                    break;
                }
            }
        }

        return this;
    }
}
