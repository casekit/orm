import { unindent } from "@casekit/unindent";

export const generateConfigFile = (directory: string) => unindent`
    import { type Config, orm } from "@casekit/orm";
    import type { OrmCLIConfig } from "@casekit/orm-cli";

    import { models } from "./${directory.replace(/^\.\//, "")}/models";

    const config = {
        models,
    } as const satisfies Config;

    export default {
        db: orm(config),
        directory: "${directory}",
    } satisfies OrmCLIConfig;
`;
