import { FieldDefinition } from "@casekit/orm-schema";

export type PopulatedFieldDefinition = Required<FieldDefinition> & {
    name: string;
};
