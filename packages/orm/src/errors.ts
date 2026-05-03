export type SingleRowOperation = "findOne" | "updateOne" | "deleteOne";

export class OrmError extends Error {
    public override readonly name: string = "OrmError";

    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, OrmError.prototype);
    }
}

export class NotFoundError extends OrmError {
    public override readonly name = "NotFoundError";
    public readonly modelName: string;
    public readonly operation: SingleRowOperation;

    constructor(
        message: string,
        details: { modelName: string; operation: SingleRowOperation },
    ) {
        super(message);
        this.modelName = details.modelName;
        this.operation = details.operation;
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

export class TooManyRowsError extends OrmError {
    public override readonly name = "TooManyRowsError";
    public readonly modelName: string;
    public readonly operation: SingleRowOperation;
    public readonly rowCount: number;

    constructor(
        message: string,
        details: {
            modelName: string;
            operation: SingleRowOperation;
            rowCount: number;
        },
    ) {
        super(message);
        this.modelName = details.modelName;
        this.operation = details.operation;
        this.rowCount = details.rowCount;
        Object.setPrototypeOf(this, TooManyRowsError.prototype);
    }
}

export class CreateFailedError extends OrmError {
    public override readonly name = "CreateFailedError";
    public readonly modelName: string;

    constructor(message: string, details: { modelName: string }) {
        super(message);
        this.modelName = details.modelName;
        Object.setPrototypeOf(this, CreateFailedError.prototype);
    }
}
