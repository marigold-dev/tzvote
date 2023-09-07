import { MatrixHttpClient } from '../MatrixHttpClient';
import { MatrixEventSendResponse } from '../models/api/MatrixEventSend';
import { MatrixSyncResponse } from '../models/api/MatrixSync';
import { MatrixStateEventMessageContent } from '../models/MatrixStateEvent';
interface MatrixScheduledEvent<T> {
    accessToken: string;
    roomId: string;
    type: MatrixEventType;
    content: any;
    txnId: string;
    onSuccess(response: T): void;
    onError(error: unknown): void;
}
declare type MatrixEventType = 'm.room.message';
export interface MatrixSyncOptions {
    syncToken?: string;
    pollingTimeout?: number;
}
/**
 * A service to help with matrix event management
 */
export declare class MatrixEventService {
    private readonly httpClient;
    private readonly cachedPromises;
    constructor(httpClient: MatrixHttpClient);
    /**
     * Get the latest state from the matrix node
     *
     * @param accessToken
     * @param options
     */
    sync(accessToken: string, options?: MatrixSyncOptions): Promise<MatrixSyncResponse>;
    /**
     * Send a message to a room
     *
     * @param accessToken
     * @param room
     * @param content
     * @param txnId
     */
    sendMessage(accessToken: string, roomId: string, content: MatrixStateEventMessageContent, txnId: string): Promise<MatrixEventSendResponse>;
    /**
     * Schedules an event to be sent to the node
     *
     * @param event
     */
    scheduleEvent(event: MatrixScheduledEvent<any>): void;
    /**
     * Send an event to the matrix node
     *
     * @param scheduledEvent
     */
    sendEvent(scheduledEvent: MatrixScheduledEvent<any>): Promise<void>;
    /**
     * Check the cache when interacting with the Matrix node, if there is an already ongoing call for the specified key, return its promise instead of duplicating the call.
     *
     * @param key
     * @param promiseProvider
     */
    private withCache;
}
export {};
