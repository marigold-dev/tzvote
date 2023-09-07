/**
 * @internalapi
 *
 * Generate a deterministic sender identifier based on a public key
 *
 * @param publicKey
 */
export declare const getSenderId: (publicKey: string) => Promise<string>;
