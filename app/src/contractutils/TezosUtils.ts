import { ConstantsResponse } from "@taquito/rpc";
import { TezosToolkit } from "@taquito/taquito";
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

export abstract class TezosUtils {
  /**
   * Return count + 1 dates that correspond to current voting period start date until end date of the last count period,
   * @param Tezos
   * @param count
   */
  public static async getCurrentAndNextAtBestVotingPeriodDates(
    Tezos: TezosToolkit,
    count: number
  ): Promise<Array<Date>> {
    return new Promise<Array<Date>>(async (resolve, reject) => {
      var dates: Array<Date> = new Array();
      var startDate: Date = await this.getVotingPeriodStartDate(Tezos);
      dates.push(startDate);
      const constantsResponse: ConstantsResponse =
        await Tezos.rpc.getConstants();
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
  public static async getVotingPeriodIndex(
    Tezos: TezosToolkit
  ): Promise<number> {
    return (await Tezos.rpc.getCurrentPeriod()).voting_period.index;
  }

  /**
   * Give date of current voting period start
   */
  public static async getVotingPeriodStartDate(
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
}
