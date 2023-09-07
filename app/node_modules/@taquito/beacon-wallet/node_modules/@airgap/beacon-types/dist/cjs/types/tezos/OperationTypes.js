"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TezosOperationType = void 0;
/**
 * @publicapi
 * @category Tezos
 */
var TezosOperationType;
(function (TezosOperationType) {
    TezosOperationType["ENDORSEMENT"] = "endorsement";
    TezosOperationType["SEED_NONCE_REVELATION"] = "seed_nonce_revelation";
    TezosOperationType["DOUBLE_ENDORSEMENT_EVIDENCE"] = "double_endorsement_evidence";
    TezosOperationType["DOUBLE_BAKING_EVIDENCE"] = "double_baking_evidence";
    TezosOperationType["ACTIVATE_ACCOUNT"] = "activate_account";
    TezosOperationType["PROPOSALS"] = "proposals";
    TezosOperationType["BALLOT"] = "ballot";
    TezosOperationType["REVEAL"] = "reveal";
    TezosOperationType["TRANSACTION"] = "transaction";
    TezosOperationType["ORIGINATION"] = "origination";
    TezosOperationType["DELEGATION"] = "delegation";
})(TezosOperationType = exports.TezosOperationType || (exports.TezosOperationType = {}));
//# sourceMappingURL=OperationTypes.js.map