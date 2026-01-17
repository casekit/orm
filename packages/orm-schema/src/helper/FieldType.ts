import { z } from "zod";

import { ModelDefinition } from "#definition/ModelDefinition.js";
import { DefaultFieldType } from "./DefaultFieldType.js";
import { FieldName } from "./FieldName.js";

export type FieldType<
    Model extends ModelDefinition,
    C extends FieldName<Model>,
> = Model["fields"][C]["zodSchema"] extends z.ZodType
    ?
          | z.infer<Model["fields"][C]["zodSchema"]>
          | (Model["fields"][C]["nullable"] extends true ? null : never)
    :
          | DefaultFieldType<Model["fields"][C]["type"]>
          | (Model["fields"][C]["nullable"] extends true ? null : never);
