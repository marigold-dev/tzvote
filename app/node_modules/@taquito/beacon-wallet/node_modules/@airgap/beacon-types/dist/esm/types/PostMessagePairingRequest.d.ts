import { PeerInfo } from './PeerInfo';
/**
 * @internalapi
 */
export interface PostMessagePairingRequest extends PeerInfo {
    id: string;
    type: 'postmessage-pairing-request';
    name: string;
    publicKey: string;
    icon?: string;
    appUrl?: string;
}
/**
 * @internalapi
 */
export declare type ExtendedPostMessagePairingRequest = PostMessagePairingRequest & {
    senderId: string;
};
