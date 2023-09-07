export var ExposedPromiseStatus;
(function (ExposedPromiseStatus) {
    ExposedPromiseStatus["PENDING"] = "pending";
    ExposedPromiseStatus["RESOLVED"] = "resolved";
    ExposedPromiseStatus["REJECTED"] = "rejected";
})(ExposedPromiseStatus || (ExposedPromiseStatus = {}));
const notInitialized = () => {
    throw new Error('ExposedPromise not initialized yet.');
};
/**
 * Exposed promise allow you to create a promise and then resolve it later, from the outside
 */
export class ExposedPromise {
    constructor() {
        this._resolve = notInitialized;
        this._reject = notInitialized;
        this._status = ExposedPromiseStatus.PENDING;
        this._promise = new Promise((innerResolve, innerReject) => {
            this._resolve = (value) => {
                if (this.isSettled()) {
                    return;
                }
                this._promiseResult = value;
                innerResolve(value);
                this._status = ExposedPromiseStatus.RESOLVED;
                return;
            };
            this._reject = (reason) => {
                if (this.isSettled()) {
                    return;
                }
                this._promiseError = reason;
                innerReject(reason);
                this._status = ExposedPromiseStatus.REJECTED;
                return;
            };
        });
    }
    get promise() {
        return this._promise;
    }
    get resolve() {
        return this._resolve;
    }
    get reject() {
        return this._reject;
    }
    get status() {
        return this._status;
    }
    get promiseResult() {
        return this._promiseResult;
    }
    get promiseError() {
        return this._promiseError;
    }
    static resolve(value) {
        const promise = new ExposedPromise();
        promise.resolve(value);
        return promise;
    }
    static reject(reason) {
        const promise = new ExposedPromise();
        promise.reject(reason);
        return promise;
    }
    isPending() {
        return this.status === ExposedPromiseStatus.PENDING;
    }
    isResolved() {
        return this.status === ExposedPromiseStatus.RESOLVED;
    }
    isRejected() {
        return this.status === ExposedPromiseStatus.REJECTED;
    }
    isSettled() {
        return this.isResolved() || this.isRejected();
    }
}
//# sourceMappingURL=exposed-promise.js.map