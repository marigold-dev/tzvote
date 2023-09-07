"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Storage = void 0;
/**
 * @internalapi
 *
 * The storage used in the SDK
 */
var Storage = /** @class */ (function () {
    function Storage() {
    }
    /**
     * Returns a promise that resolves to true if the storage option is available on this platform.
     */
    Storage.isSupported = function () {
        return Promise.resolve(false);
    };
    return Storage;
}());
exports.Storage = Storage;
//# sourceMappingURL=Storage.js.map