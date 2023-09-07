var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * A service to help with matrix event management
 */
export class MatrixEventService {
    constructor(httpClient) {
        this.httpClient = httpClient;
        this.cachedPromises = new Map();
    }
    /**
     * Get the latest state from the matrix node
     *
     * @param accessToken
     * @param options
     */
    sync(accessToken, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.withCache('sync', () => this.httpClient.get('/sync', {
                timeout: options ? options.pollingTimeout : undefined,
                since: options ? options.syncToken : undefined
            }, { accessToken }));
        });
    }
    /**
     * Send a message to a room
     *
     * @param accessToken
     * @param room
     * @param content
     * @param txnId
     */
    sendMessage(accessToken, roomId, content, txnId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => this.scheduleEvent({
                accessToken,
                roomId,
                type: 'm.room.message',
                content,
                txnId,
                onSuccess: resolve,
                onError: reject
            }));
        });
    }
    /**
     * Schedules an event to be sent to the node
     *
     * @param event
     */
    scheduleEvent(event) {
        // TODO: actual scheduling
        this.sendEvent(event);
    }
    /**
     * Send an event to the matrix node
     *
     * @param scheduledEvent
     */
    sendEvent(scheduledEvent) {
        return __awaiter(this, void 0, void 0, function* () {
            const { roomId, type, txnId, content, accessToken } = scheduledEvent;
            try {
                const response = yield this.httpClient.put(`/rooms/${encodeURIComponent(roomId)}/send/${type}/${encodeURIComponent(txnId)}`, content, { accessToken });
                scheduledEvent.onSuccess(response);
            }
            catch (error) {
                scheduledEvent.onError(error);
            }
        });
    }
    /**
     * Check the cache when interacting with the Matrix node, if there is an already ongoing call for the specified key, return its promise instead of duplicating the call.
     *
     * @param key
     * @param promiseProvider
     */
    withCache(key, promiseProvider) {
        let promise = this.cachedPromises.get(key);
        if (!promise) {
            promise = promiseProvider().finally(() => {
                this.cachedPromises.delete(key);
            });
            this.cachedPromises.set(key, promise);
        }
        return promise;
    }
}
//# sourceMappingURL=MatrixEventService.js.map