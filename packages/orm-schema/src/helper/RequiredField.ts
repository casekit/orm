import { ModelDefinition } from "#definition/ModelDefinition.js";
import { FieldName } from "./FieldName.js";
import { FieldWithDefault } from "./FieldWithDefault.js";
import { NullableField } from "./NullableField.js";
import { ProvidedField } from "./ProvidedField.js";
import { SerialField } from "./SerialField.js";

export type RequiredField<Model extends ModelDefinition> = Exclude<
    FieldName<Model>,
    | NullableField<Model>
    | FieldWithDefault<Model>
    | SerialField<Model>
    | ProvidedField<Model>
>;
