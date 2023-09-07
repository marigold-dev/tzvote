import { PeerInfo } from './PeerInfo';
/**
 * @internalapi
 */
export interface PostMessagePairingResponse extends PeerInfo {
    id: string;
    type: 'postmessage-pairing-response';
    name: string;
    publicKey: string;
    icon?: string;
    appUrl?: string;
}
/**
 * @internalapi
 */
export declare type ExtendedPostMessagePairingResponse = PostMessagePairingResponse & {
    senderId: string;
    extensionId: string;
};
