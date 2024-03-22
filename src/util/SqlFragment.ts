import { dropRight } from "lodash";

export class SQLFragment {
    public sql: string[];
    public variables: unknown[];

    constructor(
        sql: readonly string[] | string = [],
        variables: readonly unknown[] = [],
    ) {
        this.sql = typeof sql === "string" ? [sql] : [...sql];
        this.variables = [...variables];
    }

    public push(...args: (SQLFragment | string)[]): void {
        for (const arg of args) {
            if (typeof arg === "string") {
                if (this.sql.length === 0) {
                    this.sql.push(arg);
                } else {
                    this.sql[this.sql.length - 1] += arg;
                }
            } else {
                if (arg.sql.length === 0) {
                    // do nothing - fragment is empty
                } else if (this.sql.length === 0) {
                    this.sql.push(...arg.sql);
                    this.variables.push(...arg.variables);
                } else {
                    this.sql[this.sql.length - 1] += arg.sql[0];
                    this.sql.push(...arg.sql.slice(1));
                    this.variables.push(...arg.variables);
                }
            }
        }
    }

    public toQuery(
        { variableIndex } = { variableIndex: 1 },
    ): [sql: string, variables: unknown[]] {
        const sql = dropRight(
            this.sql.flatMap((f, index) => [f, `$${variableIndex + index}`]),
            1,
        ).join("");
        return [sql, [...this.variables]];
    }
}
