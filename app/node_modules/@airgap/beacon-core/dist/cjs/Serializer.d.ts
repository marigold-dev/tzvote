/**
 * @internalapi
 *
 * The Serializer is used to serialize / deserialize JSON objects and encode them with bs58check
 */
export declare class Serializer {
    /**
     * Serialize and bs58check encode an object
     *
     * @param message JSON object to serialize
     */
    serialize(message: unknown): Promise<string>;
    /**
     * Deserialize a bs58check encoded string
     *
     * @param encoded String to be deserialized
     */
    deserialize(encoded: string): Promise<unknown>;
}
