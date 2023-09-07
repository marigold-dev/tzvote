export interface PeerInfo {
    name: string;
    publicKey: string;
    version: string;
}
export declare type ExtendedPeerInfo = PeerInfo & {
    senderId: string;
};
