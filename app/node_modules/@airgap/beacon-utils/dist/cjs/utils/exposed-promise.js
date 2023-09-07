"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExposedPromise = exports.ExposedPromiseStatus = void 0;
var ExposedPromiseStatus;
(function (ExposedPromiseStatus) {
    ExposedPromiseStatus["PENDING"] = "pending";
    ExposedPromiseStatus["RESOLVED"] = "resolved";
    ExposedPromiseStatus["REJECTED"] = "rejected";
})(ExposedPromiseStatus = exports.ExposedPromiseStatus || (exports.ExposedPromiseStatus = {}));
var notInitialized = function () {
    throw new Error('ExposedPromise not initialized yet.');
};
/**
 * Exposed promise allow you to create a promise and then resolve it later, from the outside
 */
var ExposedPromise = /** @class */ (function () {
    function ExposedPromise() {
        var _this = this;
        this._resolve = notInitialized;
        this._reject = notInitialized;
        this._status = ExposedPromiseStatus.PENDING;
        this._promise = new Promise(function (innerResolve, innerReject) {
            _this._resolve = function (value) {
                if (_this.isSettled()) {
                    return;
                }
                _this._promiseResult = value;
                innerResolve(value);
                _this._status = ExposedPromiseStatus.RESOLVED;
                return;
            };
            _this._reject = function (reason) {
                if (_this.isSettled()) {
                    return;
                }
                _this._promiseError = reason;
                innerReject(reason);
                _this._status = ExposedPromiseStatus.REJECTED;
                return;
            };
        });
    }
    Object.defineProperty(ExposedPromise.prototype, "promise", {
        get: function () {
            return this._promise;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ExposedPromise.prototype, "resolve", {
        get: function () {
            return this._resolve;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ExposedPromise.prototype, "reject", {
        get: function () {
            return this._reject;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ExposedPromise.prototype, "status", {
        get: function () {
            return this._status;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ExposedPromise.prototype, "promiseResult", {
        get: function () {
            return this._promiseResult;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ExposedPromise.prototype, "promiseError", {
        get: function () {
            return this._promiseError;
        },
        enumerable: false,
        configurable: true
    });
    ExposedPromise.resolve = function (value) {
        var promise = new ExposedPromise();
        promise.resolve(value);
        return promise;
    };
    ExposedPromise.reject = function (reason) {
        var promise = new ExposedPromise();
        promise.reject(reason);
        return promise;
    };
    ExposedPromise.prototype.isPending = function () {
        return this.status === ExposedPromiseStatus.PENDING;
    };
    ExposedPromise.prototype.isResolved = function () {
        return this.status === ExposedPromiseStatus.RESOLVED;
    };
    ExposedPromise.prototype.isRejected = function () {
        return this.status === ExposedPromiseStatus.REJECTED;
    };
    ExposedPromise.prototype.isSettled = function () {
        return this.isResolved() || this.isRejected();
    };
    return ExposedPromise;
}());
exports.ExposedPromise = ExposedPromise;
//# sourceMappingURL=exposed-promise.js.map