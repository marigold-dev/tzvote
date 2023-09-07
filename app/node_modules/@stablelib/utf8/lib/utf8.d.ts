/**
 * Encodes the given string into UTF-8 byte array.
 * Throws if the source string has invalid UTF-16 encoding.
 */
export declare function encode(s: string): Uint8Array;
/**
 * Returns the number of bytes required to encode the given string into UTF-8.
 * Throws if the source string has invalid UTF-16 encoding.
 */
export declare function encodedLength(s: string): number;
/**
 * Decodes the given byte array from UTF-8 into a string.
 * Throws if encoding is invalid.
 */
export declare function decode(arr: Uint8Array): string;
