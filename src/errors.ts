export class InvalidPatchingRecordError extends Error {
    constructor(msg: string) {
        super(msg);
        Object.setPrototypeOf(this, InvalidPatchingRecordError.prototype);
    }
}

export class UpdateCustomerDataRecordError extends Error {
    constructor(msg: string) {
        super(msg);
        Object.setPrototypeOf(this, UpdateCustomerDataRecordError.prototype);
    }
}

export class UpdateCustomerControlRecordError extends Error {
    constructor(msg: string) {
        super(msg);
        Object.setPrototypeOf(this, UpdateCustomerControlRecordError.prototype);
    }
}

export class UpdatePatchRecordError extends Error {
    constructor(msg: string) {
        super(msg);
        Object.setPrototypeOf(this, UpdatePatchRecordError.prototype);
    }
}

export class QueryCustomerDataRecordError extends Error {
    constructor(msg: string) {
        super(msg);
        Object.setPrototypeOf(this, QueryCustomerDataRecordError.prototype);
    }
}

export class QueryCustomerControlRecordError extends Error {
    constructor(msg: string) {
        super(msg);
        Object.setPrototypeOf(this, QueryCustomerControlRecordError.prototype);
    }
}

