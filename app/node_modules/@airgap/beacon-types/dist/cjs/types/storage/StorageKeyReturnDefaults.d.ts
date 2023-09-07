import { StorageKey, StorageKeyReturnType } from '../..';
/**
 * @internalapi
 */
export declare type StorageKeyReturnDefaults = {
    [key in StorageKey]: StorageKeyReturnType[key];
};
/**
 * @internalapi
 */
export declare const defaultValues: StorageKeyReturnDefaults;
