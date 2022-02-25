import { MichelsonMap, TezosToolkit } from "@taquito/taquito";
import { InMemorySigner } from "@taquito/signer";
import { config } from "dotenv";
import { MichelsonV1Expression } from "@taquito/rpc";

// Set's up our environment variables from the file .env
config();

const TEZOS_SECRET_KEY = process.env.TEZOS_SECRET_KEY!;
const TEZOS_RPC_URL = process.env.TEZOS_RPC_URL!;
const TEZOS_RPC_ADDRESS = process.env.TEZOS_RPC_ADDRESS!;
const TIME = parseInt(process.env.TIME!);

const Tezos = new TezosToolkit(TEZOS_RPC_URL);

Tezos.setProvider({ signer: new InMemorySigner(TEZOS_SECRET_KEY) });

// Get Money by address endpoint
const address = TEZOS_RPC_ADDRESS;

// Send an arbitrary amount
const amount = 1;

const job = async () => {
  const michelsonV1Expression: MichelsonV1Expression = {
    prim: 'Right',
    args: [{ prim: 'Pair', args: [{ string: "hangzhounet" }, { int: "27" }] }],
  }

  console.log(`Transfering ${amount} ꜩ to ${address}...`);
  const op = await Tezos.contract.transfer(
    {
      to: address, amount: amount,
      parameter: { entrypoint: "default", value: michelsonV1Expression }
    }
  );

  console.log(`Waiting for ${op.hash} to be confirmed...`);
  await op.confirmation(1);

  console.log(`Confirmed - ${op.hash} - Funds transferred!`);
  console.log(`Check url for results: https://hangzhounet.tzkt.io/${op.hash}\n`);
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