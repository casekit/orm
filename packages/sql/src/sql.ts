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
import pg from "pg";
import { format } from "sql-formatter";
import { ZodType, z } from "zod";

import { interleave } from "@casekit/toolbox";
import { unindent } from "@casekit/unindent";

type ExpandedFragment = { text: string[]; values: unknown[] };

const joinFragments = (
    x: ExpandedFragment,
    y: ExpandedFragment,
): ExpandedFragment => {
    const initX = x.text.slice(0, -1);
    const lastX = x.text[x.text.length - 1]!;
    const tailY = y.text.slice(1);
    const firstY = y.text[0]!;

    return {
        text: [...initX, lastX + firstY, ...tailY],
        values: [...x.values, ...y.values],
    };
};

/**
 * Process template literal fragments and values into an ExpandedFragment.
 * Template literals always have one more fragment than values, so we pair
 * each value with its preceding fragment, then append the final fragment.
 */
const processTemplateParts = (
    fragments: readonly string[],
    values: readonly unknown[],
): ExpandedFragment => {
    const fragmentsCopy = [...fragments];
    const lastFragment = fragmentsCopy.pop()!;
    const pairs = fragmentsCopy.map(
        (frag, i) => [frag, values[i]] as [string, unknown],
    );

    const result = pairs
        .map(expandFragment)
        .reduce(joinFragments, { text: [""], values: [] });

    result.text[result.text.length - 1]! += lastFragment;
    return result;
};

const expandFragment = ([fragment, value]: [
    string,
    unknown,
]): ExpandedFragment => {
    if (value === undefined) {
        return { text: [fragment + "NULL"], values: [] };
    } else if (value === null) {
        return { text: [fragment + "NULL"], values: [] };
    } else if (value === true) {
        return { text: [fragment + "TRUE"], values: [] };
    } else if (value === false) {
        return { text: [fragment + "FALSE"], values: [] };
    } else if (value instanceof SQLStatement) {
        const expanded = processTemplateParts(value._text, value._values);
        return {
            text: [fragment + expanded.text[0]!, ...expanded.text.slice(1)],
            values: [...expanded.values],
        };
    } else if (value.constructor.name === "SQLStatement") {
        console.error(
            "It looks like you have multiple versions of the SQLStatement class in memory. ",
        );
        console.error(
            "This can happen if you have multiple versions of the @casekit/orm or @casekit/sql packages installed.",
        );
        console.error(
            "Please ensure you only have one version of these packages installed, and that related @casekit/orm-* packages are all at the same version.",
        );
        throw new Error("Multiple versions of SQLStatement class detected");
    } else if (Array.isArray(value) && value.length === 0) {
        return { text: [fragment + "NULL"], values: [] };
    } else if (Array.isArray(value) && value.length > 0) {
        return value
            .map((v, i) => expandFragment([i === 0 ? "" : ", ", v]))
            .reduce(joinFragments, { text: [fragment], values: [] });
    } else {
        return { text: [fragment, ""], values: [value] };
    }
};

type SQLStatementTaggedTemplateLiteral<
    ResultType extends pg.QueryResultRow = pg.QueryResultRow,
> = (
    fragments: TemplateStringsArray,
    ...values: readonly unknown[]
) => SQLStatement<ResultType>;

/**
 * @function
 * Tagged template literal that safely parameterizes an interpolated SQL query.
 * @example
 * pg.query(sql`SELECT * FROM users WHERE id = ${userId}`)
 * // is the equivalent of
 * pg.query("SELECT * FROM users WHERE id = $1", [userId])
 *
 * It's also possible to pass a zod schema to the sql tag
 * to validate and type the result:
 *
 * const userSchema = sql(z.object({ id: z.number(), name: z.string() }))`
 *    SELECT id, name FROM users WHERE id = ${userId}
 * `;
 */
function sql<ResultType extends pg.QueryResultRow = pg.QueryResultRow>(
    fragments: TemplateStringsArray,
    ...values: readonly unknown[]
): SQLStatement<ResultType>;

function sql<ResultType extends pg.QueryResultRow = pg.QueryResultRow>(
    schema: z.ZodType<ResultType>,
): SQLStatementTaggedTemplateLiteral<ResultType>;

function sql<ResultType extends pg.QueryResultRow = pg.QueryResultRow>(
    fragmentsOrSchema: TemplateStringsArray | z.ZodType<ResultType>,
    ...values: readonly unknown[]
): SQLStatement<ResultType> | SQLStatementTaggedTemplateLiteral {
    if (fragmentsOrSchema instanceof z.ZodType) {
        return (fragments, ...values) =>
            sql<ResultType>(fragments, ...values).withSchema(fragmentsOrSchema);
    }

    const result = processTemplateParts(fragmentsOrSchema, values);
    return new SQLStatement<ResultType>(result.text, result.values);
}

/**
 * Class representing a SQL statement created by the `sql` template tag.
 * Stores an array of text fragments and an array of values to interpolate,
 * such that the correct parameter placeholders can be generated when
 * the query is complete.
 * @ignore
 * NB. The SQLStatement can be parameterized with a type parameter `ResultType' for the type of the row
 * it returns. This isn't used in the class itself, but is used by the `orm.query` method
 * when the SQLStatement is passed to it to determine the type of the row. However, if the
 * call to orm.query is itself parameterized with a type, that type will take precedence.
 */
export class SQLStatement<
    ResultType extends pg.QueryResultRow = pg.QueryResultRow,
> {
    public readonly _text: string[];
    public readonly _values: unknown[];
    protected _schema?: ZodType<ResultType>;

    constructor(
        text: readonly string[] | string = [],
        values: readonly unknown[] = [],
    ) {
        this._text = typeof text === "string" ? [text] : [...text];
        this._values = [...values];
    }

    // this weirdness deals with the case where we have multiple instantiations
    // of this class, breaking instanceof. we want instanceof to work for
    // any instantiation of this class in memory, so we encode a random
    // uuid and override instanceof to check this in place of the usual check.
    // see https://github.com/colinhacks/zod/issues/2241 for more info
    private static readonly __classId = Symbol.for(
        "@casekit/orm/sql/SQLStatement-1C9E8AD8-4B55-41F0-95D0-934891ADB0C0",
    );
    public readonly __classId = SQLStatement.__classId;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static [Symbol.hasInstance](obj: any) {
        return (
            // eslint-disable-next-line
            !!obj && obj.__classId === SQLStatement.__classId
        );
    }

    /**
     * This accessor is called by node-postgres when passed as a query,
     * allowing us to pass a SQLStatement to `client.query` directly.
     */
    get text() {
        // prettier-ignore
        const text = this._text.reduce( // NOSONAR
            (prev, curr, i) => prev + "$" + i.toString() + curr,
        );
        return unindent`${text}`;
    }
    /**
     * This accessor is called by node-postgres when passed as a query,
     * allowing us to pass a SQLStatement to `client.query` directly.
     *
     * By default, when passed an array as a value, we auto-expand it into
     * multiple values. Because there are some cases where we actually want to pass
     * an array as a single value, we have a SQLValueArray class to indicate this.
     * This class prevents the array from being expanded into multiple values.
     *
     * We do it this way round because it's more common to want to expand arrays
     * than to want to pass them as a single value.
     */
    get values() {
        return this._values.map((v) =>
            v instanceof SQLValueArray ? v.values : v,
        );
    }

    /**
     * Get the pretty-printed version of the SQL statement.
     * We don't automatically apply this for two reasons:
     * 1. Speed
     * 2. It increases the potential attack surface area
     */
    get pretty() {
        return format(this.text, { language: "postgresql", tabWidth: 4 });
    }

    public append(fragments: TemplateStringsArray, ...values: unknown[]): this {
        return this.push(sql(fragments, ...values));
    }

    /**
     * Allows appending other SQLStatements onto this one, combining them.
     * Mainly used internally. Mutates the SQLStatement and returns `this`.
     */
    public push(...others: SQLStatement[]): this {
        for (const other of others) {
            if (other._text.length === 0) {
                // do nothing - statement is empty
            } else if (this._text.length === 0) {
                this._text.push(...other._text);
                this._values.push(...other._values);
            } else {
                this._text[this._text.length - 1]! += other._text[0]!;
                this._text.push(...other._text.slice(1));
                this._values.push(...other._values);
            }
        }
        return this;
    }

    /**
     * The Zod schema that will be used to parse and validate
     * the results of the query when it is passed to `orm.query`.
     */
    public get schema(): ZodType<ResultType> | undefined {
        return this._schema;
    }

    /**
     * Assign a zod schema to this SQLStatement, which will be used to validate
     * the result of the query when it is passed to `orm.query`.
     */
    public withSchema<Schema extends ZodType<pg.QueryResultRow>>(
        schema: Schema,
    ): SQLStatement<z.infer<Schema>> {
        const self = this as unknown as SQLStatement<z.infer<Schema>>;
        // @ts-expect-error - TODO figure out how to make this work with ZodType
        this._schema = schema;
        return self;
    }
}

/**
 * A class to wrap an array value that we don't want
 * to auto-expand into multiple parameters.
 */
export class SQLValueArray {
    public values: unknown[];

    constructor(values: readonly unknown[]) {
        this.values = [...values];
    }

    // this weirdness deals with the case where we have multiple instantiations
    // of this class, breaking instanceof. we want instanceof to work for
    // any instantiation of this class in memory, so we encode a random
    // uuid and override instanceof to check this in place of the usual check.
    // see https://github.com/colinhacks/zod/issues/2241 for more info
    private static readonly __classId = Symbol.for(
        "@casekit/orm/sql/SQLValueArray-67F77E7C-EB62-46DD-813E-BF58710D5CEC",
    );
    public readonly __classId = SQLValueArray.__classId;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static [Symbol.hasInstance](obj: any) {
        return (
            // eslint-disable-next-line
            !!obj && obj.__classId === SQLValueArray.__classId
        );
    }
}

const array = (values: readonly unknown[]) => new SQLValueArray(values);

const ident = (value: string) => new SQLStatement(pg.escapeIdentifier(value));

const literal = (value: string) => new SQLStatement(pg.escapeLiteral(value));

const value = (value: unknown) =>
    Array.isArray(value) ? array(value) : sql`${value}`;

const join = (values: SQLStatement[], separator = `, `) => {
    return new SQLStatement("").push(
        ...interleave(values, new SQLStatement(separator)),
    );
};

sql.array = array;
sql.ident = ident;
sql.literal = literal;
sql.join = join;
sql.value = value;

export { sql };
