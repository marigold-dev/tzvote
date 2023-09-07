import { PeerInfo } from './PeerInfo';
/**
 * @internalapi
 */
export interface P2PPairingResponse extends PeerInfo {
    id: string;
    type: 'p2p-pairing-response';
    name: string;
    publicKey: string;
    relayServer: string;
    icon?: string;
    appUrl?: string;
}
/**
 * @internalapi
 */
export declare type ExtendedP2PPairingResponse = P2PPairingResponse & {
    senderId: string;
};
