import { ConstantsResponse } from "@taquito/rpc";
import { TezosToolkit } from "@taquito/taquito";
import * as api from "@tzkt/sdk-api";
import { BigNumber } from "bignumber.js";
import { format, utcToZonedTime } from "date-fns-tz";

import {
  Storage as PermissionedSimplePollVotingContract,
  PermissionedSimplePollWalletType,
} from "../permissionedSimplePoll.types";

import { Contract } from "@tzkt/sdk-api";
import {
  TezosTemplate3WalletType,
  Storage as TezosTemplateVotingContract,
} from "../tezosTemplate3.types";
import { address, int, nat, timestamp } from "../type-aliases";

api.defaults.baseUrl =
  "https://api." + import.meta.env.VITE_NETWORK + ".tzkt.io";

export enum STATUS {
  ONGOING = "ONGOING",
  LOCKED = "LOCKED",
}

export class TransactionInvalidBeaconError {
  name: string;
  title: string;
  message: string;
  description: string;
  data_contract_handle: string;
  data_with_string: string;
  data_expected_form: string;
  data_message: string;

  /**
    * 
    * @param transactionInvalidBeaconError  {
    "name": "UnknownBeaconError",
    "title": "Aborted",
    "message": "[ABORTED_ERROR]:The action was aborted by the user.",
    "description": "The action was aborted by the user."
}
*/

  constructor(transactionInvalidBeaconError: any) {
    this.name = transactionInvalidBeaconError.name;
    this.title = transactionInvalidBeaconError.title;
    this.message = transactionInvalidBeaconError.message;
    this.description = transactionInvalidBeaconError.description;
    this.data_contract_handle = "";
    this.data_with_string = "";
    this.data_expected_form = "";
    this.data_message = this.message;
    if (transactionInvalidBeaconError.data != undefined) {
      let dataArray = Array.from<any>(
        new Map(
          Object.entries<any>(transactionInvalidBeaconError.data)
        ).values()
      );
      let contract_handle = dataArray.find(
        (obj) => obj.contract_handle != undefined
      );
      this.data_contract_handle =
        contract_handle != undefined ? contract_handle.contract_handle : "";
      let withString = dataArray.find((obj) => obj.with != undefined);
      this.data_with_string =
        withString != undefined ? withString.with.string : "";
      let expected_form = dataArray.find(
        (obj) => obj.expected_form != undefined
      );
      this.data_expected_form =
        expected_form != undefined
          ? expected_form.expected_form +
            ":" +
            expected_form.wrong_expression.string
          : "";
      this.data_message =
        (this.data_contract_handle
          ? "Error on contract : " + this.data_contract_handle + " "
          : "") +
        (this.data_with_string
          ? "error : " + this.data_with_string + " "
          : "") +
        (this.data_expected_form
          ? "error : " + this.data_expected_form + " "
          : "");
    }
  }
}

/**
 * Return count + 1 dates that correspond to current voting period start date until end date of the last count period,
 * @param Tezos
 * @param count
 */
export async function getCurrentAndNextAtBestVotingPeriodDates(
  Tezos: TezosToolkit,
  count: number
): Promise<Array<Date>> {
  return new Promise<Array<Date>>(async (resolve, reject) => {
    var dates: Array<Date> = new Array();
    var startDate: Date = await getVotingPeriodStartDate(Tezos);
    dates.push(startDate);
    const constantsResponse: ConstantsResponse = await Tezos.rpc.getConstants();
    //Provided that at least two thirds of the total active stake participates honestly in consensus,
    //then a decision is eventually taken.2 In the current implementation of Tenderbake the duration of each round increments by 15 seconds,
    // starting from 15 seconds: thus the deadline for participation in round 0 is 15 seconds,
    //that for round 1 is 45 seconds after that, and so on. So in normal conditions, when consensus is reached
    //promptly at round 0 every time, we can expect Tenderbake to add one block every 15 seconds.
    //Note that: Tenderbake has deterministic finality after just two blocks.
    //In normal conditions, when the network is healthy, decisions are made at round 0, after 15 seconds.
    //This means that in normal conditions the time to finality is about 30s.
    for (let i = 0; i < count; i++) {
      let endDate: Date = new Date(
        startDate.getTime() +
          1000 *
            constantsResponse.blocks_per_cycle *
            constantsResponse.cycles_per_voting_period! *
            constantsResponse.minimal_block_delay!.toNumber()
      );

      dates.push(endDate);
      startDate = endDate;
    }
    resolve(dates);
  });
}

/**
 * Give index of current voting period
 */
export async function getVotingPeriodIndex(
  Tezos: TezosToolkit
): Promise<number> {
  return (await Tezos.rpc.getCurrentPeriod()).voting_period.index;
}

/**
 * Give date of current voting period start
 */
export async function getVotingPeriodStartDate(
  Tezos: TezosToolkit
): Promise<Date> {
  const currentPeriodStartBlock = (await Tezos.rpc.getCurrentPeriod())
    .voting_period.start_position;

  return new Date(
    await (
      await Tezos.rpc.getBlockHeader({ block: "" + currentPeriodStartBlock })
    ).timestamp
  );
}

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
export function userCanVoteNow(
  votingContract: VotingContract,
  userAddress: address,
  bakerPower?: number,
  bakerDeactivated?: boolean
): boolean {
  if (userAddress && votingContract) {
    switch (votingContract.type) {
      case VOTING_TEMPLATE.PERMISSIONEDSIMPLEPOLL:
        return (
          !votingContract.votes.has(userAddress!) &&
          votingContract.status === STATUS.ONGOING &&
          (
            votingContract as PermissionedSimplePollVotingContract
          ).registeredVoters.indexOf(userAddress) >= 0
        );
      case VOTING_TEMPLATE.TEZOSTEMPLATE:
        return (
          !votingContract.votes.has(userAddress!) &&
          votingContract.status === STATUS.ONGOING &&
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
}

export function getWinner(
  contract:
    | PermissionedSimplePollVotingContract
    | TezosTemplateVotingContract
    | VotingContract
): Array<string> {
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
}

export async function convertFromTZKTTezosContractToTezosTemplateVotingContract(
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

export async function convertFromTZKTTezosContractToPermissionnedSimplePollTemplateVotingContract(
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

  permissionedSimplePollVotingContract.creator = tzktContract.creator?.address!;

  return permissionedSimplePollVotingContract;
}
