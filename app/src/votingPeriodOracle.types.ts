
import { ContractAbstractionFromContractType, WalletContractAbstractionFromContractType } from './type-utils';
import { address, nat } from './type-aliases';

export type Storage = {
    admin: address;
    votingPeriodIndex: nat;
};

type Methods = {
    default: (param: nat) => Promise<void>;
};

type MethodsObject = {
    default: (param: nat) => Promise<void>;
};

type contractTypes = { methods: Methods, methodsObject: MethodsObject, storage: Storage, code: { __type: 'VotingPeriodOracleCode', protocol: string, code: object[] } };
export type VotingPeriodOracleContractType = ContractAbstractionFromContractType<contractTypes>;
export type VotingPeriodOracleWalletType = WalletContractAbstractionFromContractType<contractTypes>;
