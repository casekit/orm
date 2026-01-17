import {
    FieldType,
    ModelDefinition,
    RequiredField,
} from "@casekit/orm-schema";

export type RequiredValues<Model extends ModelDefinition> =
    RequiredField<Model> extends never
        ? never
        : { [K in RequiredField<Model>]: FieldType<Model, K> };
