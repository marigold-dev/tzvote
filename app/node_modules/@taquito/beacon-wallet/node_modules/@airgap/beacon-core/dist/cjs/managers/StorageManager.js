"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageManager = void 0;
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
var StorageManager = /** @class */ (function () {
    function StorageManager(storage, storageKey) {
        this.storage = storage;
        this.storageKey = storageKey;
    }
    StorageManager.prototype.getAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.storage.get(this.storageKey)];
            });
        });
    };
    StorageManager.prototype.getOne = function (predicate) {
        return __awaiter(this, void 0, void 0, function () {
            var entities;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.storage.get(this.storageKey)];
                    case 1:
                        entities = _a.sent();
                        return [2 /*return*/, fixArrayType(entities).find(predicate)];
                }
            });
        });
    };
    StorageManager.prototype.addOne = function (element, predicate, overwrite) {
        if (overwrite === void 0) { overwrite = true; }
        return __awaiter(this, void 0, void 0, function () {
            var entities, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.storage.get(this.storageKey)];
                    case 1:
                        entities = _a.sent();
                        if (!fixArrayType(entities).some(predicate)) {
                            fixArrayType(entities).push(element);
                        }
                        else if (overwrite) {
                            for (i = 0; i < entities.length; i++) {
                                if (predicate(fixArrayType(entities)[i])) {
                                    entities[i] = element;
                                }
                            }
                        }
                        return [2 /*return*/, this.storage.set(this.storageKey, entities)];
                }
            });
        });
    };
    StorageManager.prototype.remove = function (predicate) {
        return __awaiter(this, void 0, void 0, function () {
            var entities, filteredEntities;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.storage.get(this.storageKey)];
                    case 1:
                        entities = _a.sent();
                        filteredEntities = fixArrayType(entities).filter(function (entity) { return !predicate(entity); });
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        return [2 /*return*/, this.storage.set(this.storageKey, filteredEntities)];
                }
            });
        });
    };
    StorageManager.prototype.removeAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.storage.delete(this.storageKey)];
            });
        });
    };
    return StorageManager;
}());
exports.StorageManager = StorageManager;
//# sourceMappingURL=StorageManager.js.map