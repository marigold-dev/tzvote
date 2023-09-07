/**
 * @internalapi
 *
 * The storage used in the SDK
 */
export class Storage {
    /**
     * Returns a promise that resolves to true if the storage option is available on this platform.
     */
    static isSupported() {
        return Promise.resolve(false);
    }
}
//# sourceMappingURL=Storage.js.map