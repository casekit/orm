import { WhereOperatorDefinition } from "./WhereOperator.js";

export type OperatorDefinitions = {
    where: Record<symbol, WhereOperatorDefinition>;
};
