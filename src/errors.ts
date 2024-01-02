import { ModelDefinition } from "./types/schema/definition/ModelDefinition";

type OrmErrorMeta = {
    model?: [string, ModelDefinition];
    data?: Record<string, unknown>;
};

export class OrmError extends Error {
    meta: OrmErrorMeta | undefined;

    constructor(message: string, meta?: OrmErrorMeta) {
        super();
        this.message = message;
        this.meta = meta;
    }
}

export class InvalidModelDefinitionError extends OrmError {}
