
import { ContractAbstractionFromContractType, WalletContractAbstractionFromContractType } from './type-utils';
import { address, int, key_hash, MMap, nat } from './type-aliases';

export type Storage = {
    name: string;
    options: Array<string>;
    results: MMap<string, int>;
    votes: MMap<address, string>;
    votingPeriodIndex: nat;
    votingPeriodOracle: address;
};

type Methods = {
    default: (
        _0: string,
        _1: key_hash,
    ) => Promise<void>;
};

type MethodsObject = {
    default: (params: {
        0: string,
        1: key_hash,
    }) => Promise<void>;
};

type contractTypes = { methods: Methods, methodsObject: MethodsObject, storage: Storage, code: { __type: 'TezosTemplate3Code', protocol: string, code: object[] } };
export type TezosTemplate3ContractType = ContractAbstractionFromContractType<contractTypes>;
export type TezosTemplate3WalletType = WalletContractAbstractionFromContractType<contractTypes>;
