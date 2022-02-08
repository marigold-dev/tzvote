import React, { Dispatch, SetStateAction, useState, useEffect } from "react";
import { TezosToolkit } from "@taquito/taquito";
import { BeaconWallet } from "@taquito/beacon-wallet";
import {
  NetworkType,
  BeaconEvent,
  defaultEventCallbacks
} from "@airgap/beacon-sdk";
import { DelegatesResponse } from "@taquito/rpc";

type ButtonProps = {
  Tezos: TezosToolkit;
  setContract: Dispatch<SetStateAction<any>>;
  setWallet: Dispatch<SetStateAction<any>>;
  setUserAddress: Dispatch<SetStateAction<string>>;
  setUserBalance: Dispatch<SetStateAction<number>>;
  setUserRolls: Dispatch<SetStateAction<number>>;
  setStorage: Dispatch<SetStateAction<number>>;
  contractAddress: string;
  setBeaconConnection: Dispatch<SetStateAction<boolean>>;
  setPublicToken: Dispatch<SetStateAction<string | null>>;
  wallet: BeaconWallet;
};

const ConnectButton = ({
  Tezos,
  setContract,
  setWallet,
  setUserAddress,
  setUserBalance,
  setUserRolls,
  setStorage,
  contractAddress,
  setBeaconConnection,
  setPublicToken,
  wallet
}: ButtonProps): JSX.Element => {

  const setup = async (userAddress: string): Promise<void> => {
    setUserAddress(userAddress);
    // updates balance
    const balance = await Tezos.tz.getBalance(userAddress);
    setUserBalance(balance.toNumber());
    //update rolls
    try {
      const delegatesResponse : DelegatesResponse = await Tezos.rpc.getDelegates(userAddress);
      if(delegatesResponse && delegatesResponse.voting_power){
        console.log("Pricing power found : "+delegatesResponse.voting_power);
        setUserRolls(delegatesResponse.voting_power);
      }else{
        console.log("No Pricing power found : ");
      }
    } catch (error) {
      console.log("No delegate found");
    }
  
    // creates contract instance
    const contract = await Tezos.wallet.at(contractAddress);
    const storage: any = await contract.storage();
    setContract(contract);
    setStorage(storage.toNumber());
  };

  const connectWallet = async (): Promise<void> => {
    try {
      await wallet.requestPermissions({
        network: {
          type: NetworkType.HANGZHOUNET,
          rpcUrl: "https://hangzhounet.api.tez.ie"
        }
      });
      // gets user's address
      const userAddress = await wallet.getPKH();
      await setup(userAddress);
      setBeaconConnection(true);
    } catch (error) {
      console.log(error);
    }
  };


  useEffect(() => {
    (async () => {
      // creates a wallet instance
      const wallet = new BeaconWallet({
        name: "Marigold voting",
        preferredNetwork: NetworkType.HANGZHOUNET,
        disableDefaultEvents: true, // Disable all events / UI. This also disables the pairing alert.
        eventHandlers: {
          // To keep the pairing alert, we have to add the following default event handlers back
          [BeaconEvent.PAIR_INIT]: {
            handler: defaultEventCallbacks.PAIR_INIT
          },
          [BeaconEvent.PAIR_SUCCESS]: {
            handler: data => setPublicToken(data.publicKey)
          }
        }
      });
      Tezos.setWalletProvider(wallet);
      setWallet(wallet);
      // checks if wallet was connected before
      const activeAccount = await wallet.client.getActiveAccount();
      if (activeAccount) {
        const userAddress = await wallet.getPKH();
        await setup(userAddress);
        setBeaconConnection(true);
      }
    })();
  }, []);

  return (
    <div className="buttons">
      <button className="button" onClick={connectWallet}>
        <span>
          <i className="fas fa-wallet"></i>&nbsp; Connect with wallet
        </span>
      </button>
    </div>
  );
};

export default ConnectButton;
