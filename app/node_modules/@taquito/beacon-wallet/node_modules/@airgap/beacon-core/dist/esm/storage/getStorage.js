var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Logger } from '../utils/Logger';
import { ChromeStorage, LocalStorage } from '..';
const logger = new Logger('STORAGE');
/**
 * Get a supported storage on this platform
 */
export const getStorage = () => __awaiter(void 0, void 0, void 0, function* () {
    if (yield ChromeStorage.isSupported()) {
        logger.log('getStorage', 'USING CHROME STORAGE');
        return new ChromeStorage();
    }
    else if (yield LocalStorage.isSupported()) {
        logger.log('getStorage', 'USING LOCAL STORAGE');
        return new LocalStorage();
    }
    else {
        throw new Error('no storage type supported');
    }
});
//# sourceMappingURL=getStorage.js.map