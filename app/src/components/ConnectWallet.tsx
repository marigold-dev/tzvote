import { NetworkType } from "@airgap/beacon-sdk";
import { Button } from "@mui/material";
import { BeaconWallet } from "@taquito/beacon-wallet";
import { DelegatesResponse } from "@taquito/rpc";
import { TezosToolkit } from "@taquito/taquito";
import { Dispatch, SetStateAction } from "react";

type ButtonProps = {
  Tezos: TezosToolkit;
  setWallet: Dispatch<SetStateAction<any>>;
  setUserAddress: Dispatch<SetStateAction<string>>;
  setUserBalance: Dispatch<SetStateAction<number>>;
  setBakerDelegators: Dispatch<SetStateAction<string[]>>;
  setBakerPower: Dispatch<SetStateAction<number>>;
  setBeaconConnection: Dispatch<SetStateAction<boolean>>;
  setPublicToken: Dispatch<SetStateAction<string | null>>;
  wallet: BeaconWallet;
};

const ConnectButton = ({
  Tezos,
  setWallet,
  setUserAddress,
  setUserBalance,
  setBakerDelegators,
  setBakerPower,
  setBeaconConnection,
  wallet,
}: ButtonProps): JSX.Element => {
  const setup = async (userAddress: string): Promise<void> => {
    setUserAddress(userAddress);
    // updates balance
    const balance = await Tezos.tz.getBalance(userAddress);
    setUserBalance(balance.toNumber());
    //update baker power
    try {
      const delegatesResponse: DelegatesResponse = await Tezos.rpc.getDelegates(
        userAddress
      );
      if (
        delegatesResponse !== undefined &&
        delegatesResponse.delegated_contracts !== undefined &&
        delegatesResponse.delegated_balance !== undefined
      ) {
        console.log("We have a baker");
        setBakerDelegators(delegatesResponse.delegated_contracts);
        setBakerPower(Number(delegatesResponse.voting_power));
      } else {
        setBakerPower(0);
        console.log("We have a baker with no power");
      }
    } catch (error) {
      console.log("We have a simple user");
    }
  };

  const connectWallet = async (): Promise<void> => {
    try {
      await wallet.requestPermissions({
        network: {
          type: process.env["REACT_APP_NETWORK"]
            ? NetworkType[
                process.env[
                  "REACT_APP_NETWORK"
                ].toUpperCase() as keyof typeof NetworkType
              ]
            : NetworkType.GHOSTNET,
          rpcUrl: process.env["REACT_APP_TEZOS_NODE"],
        },
      });
      // gets user's address
      const userAddress = await wallet.getPKH();
      await setup(userAddress);
      setBeaconConnection(true);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Button variant="contained" onClick={connectWallet}>
      <i className="fas fa-wallet"></i>&nbsp; Connect with wallet
    </Button>
  );
};

export default ConnectButton;
