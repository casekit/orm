import { BaseModel } from "./schema/types/base/BaseModel";

type OrmErrorMeta = {
    model?: [string, BaseModel];
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
