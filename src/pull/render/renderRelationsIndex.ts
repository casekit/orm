import { camelCase } from "lodash-es";

import { format } from "../util/format";

export const renderRelationsIndex = async (tableNames: string[]) => {
    const names = tableNames.map((t) => camelCase(t));

    const imports = names.map(
        (name) => `import { ${name} } from "./models/${name}.relations";`,
    );
    const exports = names.map((name) => `${name},`);

    return await format(
        `
            ${imports.join("\n")}

            export const relations = {
                ${exports.join("\n")}
            };

            export type Relations = typeof relations;
            `,
    );
};
