import { MichelsonPrimitives } from '../..';
/**
 * @internalapi
 * @category Tezos
 */
export declare type MichelineMichelsonV1Expression = {
    int: string;
} | {
    string: string;
} | {
    bytes: string;
} | MichelineMichelsonV1Expression[] | {
    prim: MichelsonPrimitives;
    args?: MichelineMichelsonV1Expression[];
    annots?: string[];
};
