import { ModelDefinition } from "@casekit/orm-schema";

import { PopulatedFieldDefinition } from "./PopulatedFieldDefinition.js";

export type PopulatedModelDefinition = Required<ModelDefinition> & {
    name: string;
    fields: Record<string, PopulatedFieldDefinition>;
};
