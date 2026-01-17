import { FieldType, ModelDefinition, OptionalField } from "@casekit/orm-schema";

export type OptionalValues<Model extends ModelDefinition> =
    OptionalField<Model> extends never
        ? never
        : { [K in OptionalField<Model>]?: FieldType<Model, K> | null };
