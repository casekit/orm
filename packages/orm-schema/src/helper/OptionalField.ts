import { ModelDefinition } from "#definition/ModelDefinition.js";
import { FieldName } from "./FieldName.js";
import { RequiredField } from "./RequiredField.js";

export type OptionalField<Model extends ModelDefinition> = Exclude<
    FieldName<Model>,
    RequiredField<Model>
>;
