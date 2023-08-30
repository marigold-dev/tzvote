import * as api from "@tzkt/sdk-api";
import { STATUS } from "./TezosUtils";

import {
  Storage as PermissionedSimplePollVotingContract,
  PermissionedSimplePollWalletType,
} from "../permissionedSimplePoll.types";

import { TezosToolkit } from "@taquito/taquito";
import { Contract } from "@tzkt/sdk-api";
import {
  TezosTemplate3WalletType,
  Storage as TezosTemplateVotingContract,
} from "../tezosTemplate3.types";
import { address, int, timestamp } from "../type-aliases";

api.defaults.baseUrl =
  "https://api." + import.meta.env.VITE_NETWORK + ".tzkt.io";

export class VOTING_TEMPLATE {
  public static readonly TEZOSTEMPLATE = new VOTING_TEMPLATE(
    "bakers",
    "For bakers only, it uses bakers' roll power to vote and sticks to a Tezos voting period"
  );
  public static readonly PERMISSIONEDSIMPLEPOLL = new VOTING_TEMPLATE(
    "permissioned",
    "Contract owner can add/remove permissioned addresses. Each address has 1 vote power. Period dates are free of choice"
  );

  private constructor(
    public readonly name: string,
    public readonly description: string
  ) {}
}

export type VotingContract = (
  | PermissionedSimplePollVotingContract
  | TezosTemplateVotingContract
) & {
  type: VOTING_TEMPLATE;
  address: address;
  from: timestamp;
  to: timestamp;
  status?: STATUS; //calculated at initialization
  creator: string;
};

/**
 * Return if user can vote now
 * @param userAddress the user address
 * @param bakerPower (optional) baker power number
 * @returns boolean
 */
export const userCanVoteNow = (
  votingContract: VotingContract,
  userAddress: address,
  bakerPower?: number
): boolean => {
  switch (votingContract.type) {
    case VOTING_TEMPLATE.PERMISSIONEDSIMPLEPOLL:
      return (
        !votingContract.votes.has(userAddress!) &&
        votingContract.status == STATUS.ONGOING &&
        (
          votingContract as PermissionedSimplePollVotingContract
        ).registeredVoters.indexOf(userAddress) >= 0
      );
    case VOTING_TEMPLATE.TEZOSTEMPLATE:
      return (
        !votingContract.votes.has(userAddress!) &&
        votingContract.status == STATUS.ONGOING &&
        bakerPower! > 0
      );
    default:
      throw Error("Cannot guess votingContract type");
  }
};

export const getWinner = (
  contract: PermissionedSimplePollVotingContract | TezosTemplateVotingContract
): Array<string> => {
  var winnerList: Array<string> = [];
  var maxScore: number = 0;
  contract.results.forEach((value: int, key: string) => {
    if (value.eq(maxScore)) {
      winnerList.push(key);
    } else if (value.gt(maxScore)) {
      winnerList = [];
      winnerList.push(key);
    } else {
      //pass
    }
  });
  return winnerList;
};

export abstract class VotingContractUtils {
  public static async convertFromTZKTTezosContractToTezosTemplateVotingContract(
    Tezos: TezosToolkit,
    tzktContract: Contract
  ): Promise<VotingContract> {
    const tezosTemplate3WalletType: TezosTemplate3WalletType =
      await Tezos.wallet.at<TezosTemplate3WalletType>(tzktContract.address!);

    let tezosTemplateVotingContract: VotingContract =
      (await tezosTemplate3WalletType.storage()) as VotingContract;
    tezosTemplateVotingContract.type = VOTING_TEMPLATE.TEZOSTEMPLATE;

    let votingPeriodBlockResult = await Tezos.rpc.getCurrentPeriod();
    const currentPeriodStartBlock =
      votingPeriodBlockResult.voting_period.start_position;

    let dateFrom = new Date(
      await (
        await Tezos.rpc.getBlockHeader({ block: "" + currentPeriodStartBlock })
      ).timestamp
    );

    const constantsResponse = await Tezos.rpc.getConstants();
    let blocksUntilTheEnd: number = constantsResponse.blocks_per_voting_period;
    //Provided that at least two thirds of the total active stake participates honestly in consensus, then a decision is eventually taken.2 In the current implementation of Tenderbake the duration of each round increments by 15 seconds, starting from 30 seconds: thus the deadline for participation in round 0 is 30 seconds, that for round 1 is 45 seconds after that, and so on. So in normal conditions, when consensus is reached promptly at round 0 every time, we can expect Tenderbake to add one block every 30 seconds. Note that: Tenderbake has deterministic finality after just two blocks. In normal conditions, when the network is healthy, decisions are made at round 0, after 30 seconds. This means that in normal conditions the time to finality is about one minute.
    const block_estimated_duration = 30;
    let dateTo = new Date(
      dateFrom.getTime() + 1000 * blocksUntilTheEnd * block_estimated_duration
    );
    if (
      tzktContract.storage.votingPeriodIndex ==
      votingPeriodBlockResult.voting_period.index
    ) {
      //if current, we can have more accurate thatns to remaining blocks data
      blocksUntilTheEnd = votingPeriodBlockResult.remaining;
      dateTo = new Date(
        Date.now() + 1000 * blocksUntilTheEnd * block_estimated_duration
      );
    }

    tezosTemplateVotingContract.from = dateFrom.toISOString() as timestamp;
    tezosTemplateVotingContract.to = dateTo.toISOString() as timestamp;

    tezosTemplateVotingContract.status = (
      tezosTemplateVotingContract as TezosTemplateVotingContract
    ).votingPeriodIndex.eq(votingPeriodBlockResult.voting_period.index)
      ? STATUS.ONGOING
      : STATUS.LOCKED;

    tezosTemplateVotingContract.creator = tzktContract.creator?.address!;

    return tezosTemplateVotingContract;
  }

  public static async convertFromTZKTTezosContractToPermissionnedSimplePollTemplateVotingContract(
    Tezos: TezosToolkit,
    tzktContract: Contract
  ): Promise<VotingContract> {
    const permissionedSimplePollWalletType: PermissionedSimplePollWalletType =
      await Tezos.wallet.at<PermissionedSimplePollWalletType>(
        tzktContract.address!
      );

    let permissionedSimplePollVotingContract: VotingContract =
      (await permissionedSimplePollWalletType.storage()) as VotingContract;
    permissionedSimplePollVotingContract.type =
      VOTING_TEMPLATE.PERMISSIONEDSIMPLEPOLL;

    permissionedSimplePollVotingContract.from = (
      permissionedSimplePollVotingContract as PermissionedSimplePollVotingContract
    ).from_;

    permissionedSimplePollVotingContract.status =
      new Date() > new Date(permissionedSimplePollVotingContract.from) &&
      new Date() < new Date(permissionedSimplePollVotingContract.to)
        ? STATUS.ONGOING
        : STATUS.LOCKED;

    permissionedSimplePollVotingContract.creator =
      tzktContract.creator?.address!;

    return permissionedSimplePollVotingContract;
  }
}
