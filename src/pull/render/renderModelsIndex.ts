import { camelCase } from "lodash-es";

import { format } from "../util/format";

export const renderModelsIndex = async (tableNames: string[]) => {
    const names = tableNames.map((t) => camelCase(t));

    const imports = names.map(
        (name) => `import { ${name} } from "./models/${name}.model";`,
    );
    const exports = names.map((name) => `${name},`);

    return await format(
        `
            ${imports.join("\n")}

            export const models = {
                ${exports.join("\n")}
            };

            export type Models = typeof models;
            `,
    );
};
