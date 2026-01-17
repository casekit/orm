import path from "node:path";

import { prettify } from "#util/prettify.js";

export const generateModelFile = async (
    name: string,
    directory: string,
): Promise<string> => {
    const code = `import type { ModelDefinition } from "@casekit/orm";

export const ${name} = {
    fields: {},
} as const satisfies ModelDefinition;
`;

    return await prettify(path.join(process.cwd(), directory), code);
};
