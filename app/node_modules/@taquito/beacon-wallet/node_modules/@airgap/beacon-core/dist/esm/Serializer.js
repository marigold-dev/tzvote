var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as bs58check from 'bs58check';
/**
 * @internalapi
 *
 * The Serializer is used to serialize / deserialize JSON objects and encode them with bs58check
 */
export class Serializer {
    /**
     * Serialize and bs58check encode an object
     *
     * @param message JSON object to serialize
     */
    serialize(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const str = JSON.stringify(message);
            return bs58check.encode(Buffer.from(str));
        });
    }
    /**
     * Deserialize a bs58check encoded string
     *
     * @param encoded String to be deserialized
     */
    deserialize(encoded) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof encoded !== 'string') {
                throw new Error('Encoded payload needs to be a string');
            }
            return JSON.parse(bs58check.decode(encoded).toString());
        });
    }
}
//# sourceMappingURL=Serializer.js.map