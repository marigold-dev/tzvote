var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/* eslint-disable prefer-arrow/prefer-arrow-functions */
function fixArrayType(array) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return array;
}
/* eslint-enable prefer-arrow/prefer-arrow-functions */
/**
 * @internalapi
 *
 * The StorageManager provides CRUD functionality for specific entities and persists them to the provided storage.
 */
export class StorageManager {
    constructor(storage, storageKey) {
        this.storage = storage;
        this.storageKey = storageKey;
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.storage.get(this.storageKey);
        });
    }
    getOne(predicate) {
        return __awaiter(this, void 0, void 0, function* () {
            const entities = yield this.storage.get(this.storageKey);
            return fixArrayType(entities).find(predicate);
        });
    }
    addOne(element, predicate, overwrite = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const entities = yield this.storage.get(this.storageKey);
            if (!fixArrayType(entities).some(predicate)) {
                fixArrayType(entities).push(element);
            }
            else if (overwrite) {
                for (let i = 0; i < entities.length; i++) {
                    if (predicate(fixArrayType(entities)[i])) {
                        entities[i] = element;
                    }
                }
            }
            return this.storage.set(this.storageKey, entities);
        });
    }
    remove(predicate) {
        return __awaiter(this, void 0, void 0, function* () {
            const entities = yield this.storage.get(this.storageKey);
            const filteredEntities = fixArrayType(entities).filter((entity) => !predicate(entity));
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return this.storage.set(this.storageKey, filteredEntities);
        });
    }
    removeAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.storage.delete(this.storageKey);
        });
    }
}
//# sourceMappingURL=StorageManager.js.map