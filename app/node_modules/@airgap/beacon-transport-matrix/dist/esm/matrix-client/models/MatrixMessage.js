import { isTextMessageEvent } from '../utils/events';
export var MatrixMessageType;
(function (MatrixMessageType) {
    MatrixMessageType["TEXT"] = "m.text";
})(MatrixMessageType || (MatrixMessageType = {}));
export class MatrixMessage {
    constructor(type, sender, content, timestamp) {
        this.type = type;
        this.sender = sender;
        this.content = content;
        this.timestamp = timestamp;
    }
    /**
     * Construct a message from a message event
     *
     * @param event
     */
    static from(event) {
        if (isTextMessageEvent(event)) {
            return new MatrixMessage(event.content.msgtype, event.sender, event.content.body, event.origin_server_ts);
        }
        // for now only text messages are supported
        return undefined;
    }
}
//# sourceMappingURL=MatrixMessage.js.map