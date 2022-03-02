import React, { Dispatch, SetStateAction, useState, useEffect } from "react";
import { TezosToolkit } from "@taquito/taquito";
import { BeaconWallet } from "@taquito/beacon-wallet";
import {
  NetworkType
} from "@airgap/beacon-sdk";
import { DelegatesResponse } from "@taquito/rpc";

type ButtonProps = {
  Tezos: TezosToolkit;
  setWallet: Dispatch<SetStateAction<any>>;
  setUserAddress: Dispatch<SetStateAction<string>>;
  setUserBalance: Dispatch<SetStateAction<number>>;
  setUserRolls: Dispatch<SetStateAction<number>>;
  setBeaconConnection: Dispatch<SetStateAction<boolean>>;
  setPublicToken: Dispatch<SetStateAction<string | null>>;
  wallet: BeaconWallet;
  setFirstTime: Dispatch<SetStateAction<boolean>>;
};

const ConnectButton = ({
  Tezos,
  setWallet,
  setUserAddress,
  setUserBalance,
  setUserRolls,
  setBeaconConnection,
  setFirstTime,
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
      if(delegatesResponse != undefined && delegatesResponse.voting_power != undefined){
        console.log("Pricing power found : "+delegatesResponse.voting_power);
        setUserRolls(delegatesResponse.voting_power);
      }else{
        console.log("No Pricing power found");
      }
    } catch (error) {
      console.log("No delegate found");
    }
  };

  const connectWallet = async (): Promise<void> => {
    try {
      await wallet.requestPermissions({
        network: {
          type: process.env["NETWORK"]? NetworkType[process.env["NETWORK"].toUpperCase() as keyof typeof NetworkType]  : NetworkType.HANGZHOUNET,
          rpcUrl: process.env["TEZOS_NODE"] ||"https://hangzhounet.api.tez.ie"
        }
      });
      // gets user's address
      const userAddress = await wallet.getPKH();
      await setup(userAddress);
      setBeaconConnection(true);
      setFirstTime(false);
    } catch (error) {
      console.log(error);
    }
  };


  useEffect(() => {
    (async () => {
      // creates a wallet instance if not exists
      if(!wallet){wallet = new BeaconWallet({
        name: "TzVote",
        preferredNetwork: process.env["NETWORK"]? NetworkType[process.env["NETWORK"].toUpperCase() as keyof typeof NetworkType]  : NetworkType.HANGZHOUNET,
      });}
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
