import { MichelsonMap, TezosToolkit } from "@taquito/taquito";
import { InMemorySigner } from "@taquito/signer";
import { config } from "dotenv";
import BigNumber from "bignumber.js";

type OracleStorage = {
  votingPeriodIndexes: MichelsonMap<string, BigNumber>,
  admin: string
};

// Set's up our environment variables from the file .env
config();

const TEZOS_RPC_URL = process.env.TEZOS_RPC_URL!;
const TEZOS_RPC_ADDRESS = process.env.TEZOS_RPC_ADDRESS!;
const TEZOS_SECRET_KEY = process.env.TEZOS_SECRET_KEY!;
const TEZOS_NETWORK = process.env.TEZOS_NETWORK || "mainnet"
const TIME = parseInt(process.env.TIME) || 15000;
const AMMOUNT = parseInt(process.env.AMMOUNT) || 0;
const CONFIRMATION = parseInt(process.env.CONFIRMATION) || 1;

const Tezos = new TezosToolkit(TEZOS_RPC_URL);

Tezos.setProvider({ signer: new InMemorySigner(TEZOS_SECRET_KEY) });

const job = async () => {
  const response = await Tezos.rpc.getCurrentPeriod();
  const period = response.voting_period.index;
  const contract = await Tezos.wallet.at(TEZOS_RPC_ADDRESS);
  const storage = await contract.storage<OracleStorage>();
  const currentValue = storage.votingPeriodIndexes.get(TEZOS_NETWORK)

  if (currentValue.toString() != period.toString()) {
    console.log(`The current value (${currentValue.toString()}) is NOT the same that the voting period value (${period.toString()})!`);
    console.log(`Transfering ${AMMOUNT} ꜩ to ${TEZOS_RPC_ADDRESS}...`);

    const transfer = contract.methods.updateCurrentVotingPeriod(TEZOS_NETWORK, period)
      .toTransferParams({ amount: AMMOUNT });

    const op = await Tezos.contract.transfer(transfer)

    console.log(`Waiting for ${op.hash} to be confirmed...`);
    await op.confirmation(CONFIRMATION);

    console.log(`Confirmed - ${op.hash} - Funds transferred!`);
    console.log(`Check url for results: https://${TEZOS_NETWORK}.tzkt.io/${op.hash}\n`);
  } else {
    console.log(`The current value (${currentValue.toString()}) is the same that the voting period value (${period.toString()})!`);
    console.log(`Transection skipped!`);
  }
}

const cron = () => new Promise(resolve => setTimeout(resolve, TIME));

(async function cronjob() {
  try {
    await job();
  } catch (error) {
    console.error((error as any).message);
  }
  await cron();
  await cronjob();
})();