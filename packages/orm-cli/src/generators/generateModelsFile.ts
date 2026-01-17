import { unindent } from "@casekit/unindent";

export const generateModelsFile = (models: string[]) => unindent`
    ${models.map((m) => `import { ${m} } from "./${m}";`).join("\n")};

    export const models = {
        ${models.map((m) => `${m},`).join("\n")}
    }
`;
