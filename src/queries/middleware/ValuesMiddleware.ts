import { BaseConfiguration } from "../../schema/types/base/BaseConfiguration";

export type ValuesMiddleware = (
    values: Record<string, unknown>,
    meta: {
        model: string;
        config: BaseConfiguration;
    },
) => Record<string, unknown>;
