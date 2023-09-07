import { MatrixStateEvent } from './MatrixStateEvent';
export declare enum MatrixMessageType {
    TEXT = "m.text"
}
export declare class MatrixMessage<T> {
    readonly type: MatrixMessageType;
    readonly sender: string;
    readonly content: T;
    readonly timestamp: number;
    /**
     * Construct a message from a message event
     *
     * @param event
     */
    static from(event: MatrixStateEvent): MatrixMessage<unknown> | undefined;
    private constructor();
}
