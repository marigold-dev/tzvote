var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { StorageManager } from './StorageManager';
/**
 * @internalapi
 *
 * The PeerManager provides CRUD functionality for peer entities and persists them to the provided storage.
 */
export class PeerManager {
    constructor(storage, key) {
        this.storageManager = new StorageManager(storage, key);
    }
    hasPeer(publicKey) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.getPeer(publicKey)) ? true : false;
        });
    }
    getPeers() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.storageManager.getAll();
        });
    }
    getPeer(publicKey) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.storageManager.getOne((peer) => peer.publicKey === publicKey);
        });
    }
    addPeer(peerInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.storageManager.addOne(peerInfo, (peer) => peer.publicKey === peerInfo.publicKey);
        });
    }
    removePeer(publicKey) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.storageManager.remove((peer) => peer.publicKey === publicKey);
        });
    }
    removePeers(publicKeys) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.storageManager.remove((peer) => publicKeys.includes(peer.publicKey));
        });
    }
    removeAllPeers() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.storageManager.removeAll();
        });
    }
}
//# sourceMappingURL=PeerManager.js.map