import { PeerInfo } from './PeerInfo';
/**
 * @internalapi
 */
export interface P2PPairingRequest extends PeerInfo {
    id: string;
    type: 'p2p-pairing-request';
    name: string;
    publicKey: string;
    relayServer: string;
    icon?: string;
    appUrl?: string;
}
/**
 * @internalapi
 */
export declare type ExtendedP2PPairingRequest = P2PPairingRequest & {
    senderId: string;
};
