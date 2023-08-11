
import { ContractAbstractionFromContractType, WalletContractAbstractionFromContractType } from './type-utils';
import { address, int, MMap, timestamp } from './type-aliases';

export type Storage = {
    from_: timestamp;
    name: string;
    options: Array<string>;
    owner: address;
    registeredVoters: Array<address>;
    results: MMap<string, int>;
    to: timestamp;
    votes: MMap<address, string>;
};

type Methods = {
    addVoter: (param: address) => Promise<void>;
    removeVoter: (param: address) => Promise<void>;
    vote: (param: string) => Promise<void>;
};

type MethodsObject = {
    addVoter: (param: address) => Promise<void>;
    removeVoter: (param: address) => Promise<void>;
    vote: (param: string) => Promise<void>;
};

type contractTypes = { methods: Methods, methodsObject: MethodsObject, storage: Storage, code: { __type: 'PermissionedSimplePollCode', protocol: string, code: object[] } };
export type PermissionedSimplePollContractType = ContractAbstractionFromContractType<contractTypes>;
export type PermissionedSimplePollWalletType = WalletContractAbstractionFromContractType<contractTypes>;
