import * as api from "@tzkt/sdk-api";
import { BigNumber } from "bignumber.js";
import { format, utcToZonedTime } from "date-fns-tz";
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
import { address, int, nat, timestamp } from "../type-aliases";

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
  bakerPower?: number,
  bakerDeactivated?: boolean
): boolean => {
  if (userAddress && votingContract) {
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
          bakerPower! > 0 &&
          !bakerDeactivated
        );
      default:
        throw Error("Cannot guess votingContract type");
    }
  } else {
    console.warn("cannot check if time to vote, ignoring the call.. ");
    return false;
  }
};

export const getWinner = (
  contract:
    | PermissionedSimplePollVotingContract
    | TezosTemplateVotingContract
    | VotingContract
): Array<string> => {
  var winnerList: Array<string> = [];
  var maxScore: number = 0;
  contract.results.forEach((value: int, key: string) => {
    if (value.eq(maxScore)) {
      winnerList.push(key);
    } else if (value.gt(maxScore)) {
      winnerList = [];
      winnerList.push(key);
      maxScore = value.toNumber();
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
    if (!tzktContract.storage) {
      console.error("TZKT Storage not loaded", tzktContract);
      throw new Error("TZKT Storage not loaded");
    }

    const tezosTemplate3WalletType: TezosTemplate3WalletType =
      await Tezos.wallet.at<TezosTemplate3WalletType>(tzktContract.address!);

    let tezosTemplateVotingContract: VotingContract =
      (await tezosTemplate3WalletType.storage()) as VotingContract;
    tezosTemplateVotingContract.type = VOTING_TEMPLATE.TEZOSTEMPLATE;
    tezosTemplateVotingContract.address = tzktContract.address as address;

    //index
    let tzktVotingPeriod: api.VotingPeriod = await api.votingGetPeriod(
      Number(tzktContract.storage.votingPeriodIndex as string)
    );

    (
      tezosTemplateVotingContract as TezosTemplateVotingContract
    ).votingPeriodIndex = new BigNumber(tzktVotingPeriod.index!) as nat;

    // Get the time zone set on the user's device
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    tezosTemplateVotingContract.from = format(
      utcToZonedTime(new Date(tzktVotingPeriod.startTime!), userTimeZone),
      "yyyy-MM-dd'T'HH:mm:ssXXX",
      { timeZone: userTimeZone }
    ) as timestamp;

    tezosTemplateVotingContract.to = format(
      utcToZonedTime(new Date(tzktVotingPeriod.endTime!), userTimeZone),
      "yyyy-MM-dd'T'HH:mm:ssXXX",
      { timeZone: userTimeZone }
    ) as timestamp;

    const currentVotingPeriod = await Tezos.rpc.getCurrentPeriod();
    tezosTemplateVotingContract.status =
      currentVotingPeriod.voting_period.index === tzktVotingPeriod.index!
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

    permissionedSimplePollVotingContract.address =
      tzktContract.address as address;

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
