import { NetworkType } from "@airgap/beacon-sdk";
import { IonButton } from "@ionic/react";
import { BeaconWallet } from "@taquito/beacon-wallet";
import { DelegatesResponse } from "@taquito/rpc";
import { TezosToolkit } from "@taquito/taquito";
import { Dispatch, SetStateAction } from "react";

type ButtonProps = {
  Tezos: TezosToolkit;
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
  setUserAddress,
  setUserBalance,
  wallet,

  setBakerDelegators,
  setBakerPower,
  setBeaconConnection,
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
        delegatesResponse.staking_balance !== undefined
      ) {
        console.log("We have a baker");
        setBakerDelegators(delegatesResponse.delegated_contracts);
        setBakerPower(delegatesResponse.staking_balance.toNumber());
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
          type: import.meta.env.VITE_NETWORK
            ? NetworkType[
                import.meta.env.VITE_NETWORK.toUpperCase() as keyof typeof NetworkType
              ]
            : NetworkType.GHOSTNET,
          rpcUrl: import.meta.env.VITE_TEZOS_NODE,
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
    <IonButton onClick={connectWallet}>
      <i className="fas fa-wallet"></i>&nbsp; Connect with wallet
    </IonButton>
  );
};

export default ConnectButton;
