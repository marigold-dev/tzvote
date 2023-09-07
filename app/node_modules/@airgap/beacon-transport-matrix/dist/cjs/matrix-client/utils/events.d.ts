import { MatrixStateEvent, MatrixStateEventMessageText } from '../models/MatrixStateEvent';
/**
 * Check if an event is a create event
 *
 * @param event MatrixStateEvent
 */
export declare const isCreateEvent: (event: MatrixStateEvent) => boolean;
/**
 * Check if an event is a join event
 *
 * @param event MatrixStateEvent
 */
export declare const isJoinEvent: (event: MatrixStateEvent) => boolean;
/**
 * Check if an event is a message event
 *
 * @param event MatrixStateEvent
 */
export declare const isMessageEvent: (event: MatrixStateEvent) => boolean;
/**
 * Check if an event is a text message event
 *
 * @param event MatrixStateEvent
 */
export declare const isTextMessageEvent: (event: MatrixStateEvent) => event is MatrixStateEventMessageText;
