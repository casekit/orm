import type { SchemaDiffOperation } from "../diff/types.js";

export type SafetyLevel = "safe" | "cautious" | "unsafe";

export interface SafetyWarning {
    level: SafetyLevel;
    operation: SchemaDiffOperation;
    message: string;
    suggestion?: string;
}
