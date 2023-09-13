import { NetworkType } from "@airgap/beacon-sdk";
import { IonButton, IonIcon, IonLabel } from "@ionic/react";
import {
  TzCommunityReactContext,
  TzCommunityReactContextType,
} from "@marigold-dev/tezos-community-reactcontext";
import { DelegatesResponse } from "@taquito/rpc";
import { walletOutline } from "ionicons/icons";
import React from "react";
import { useHistory } from "react-router";
import { PAGES, UserContext, UserContextType } from "../App";
import { address } from "../type-aliases";

import { getUserProfile } from "@marigold-dev/tezos-community";
const ConnectButton = (): JSX.Element => {
  const {
    Tezos,
    setUserAddress,
    wallet,
    setBakerDelegators,
    setBakerPower,
    setBakerDeactivated,
  } = React.useContext(UserContext) as UserContextType;

  const {
    setUserProfile,
    connectToWeb2Backend,
    localStorage,
    setUserProfiles,
    userProfiles,
  } = React.useContext(TzCommunityReactContext) as TzCommunityReactContextType;

  const { replace } = useHistory();

  const setup = async (userAddress: string): Promise<void> => {
    setUserAddress(userAddress);

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
        setBakerDelegators(delegatesResponse.delegated_contracts);
        setBakerPower(
          delegatesResponse.voting_power
            ? delegatesResponse.voting_power.toNumber()
            : 0
        );
        setBakerDeactivated(delegatesResponse.deactivated);
        console.log(
          "We have a baker with power ",
          delegatesResponse.staking_balance.toNumber(),
          " and delegators ",
          delegatesResponse.delegated_contracts,
          " and status deactivated  ",
          delegatesResponse.deactivated,
          " and voting_power  ",
          delegatesResponse.voting_power
        );
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
          type: NetworkType[
            import.meta.env.VITE_NETWORK.toUpperCase() as keyof typeof NetworkType
          ],
          rpcUrl: import.meta.env.VITE_TEZOS_NODE,
        },
      });
      // gets user's address
      const userAddress = await wallet.getPKH();
      await setup(userAddress);

      //connect to TzCommunity
      await connectToWeb2Backend(
        wallet,
        userAddress,
        (
          await wallet.client.getActiveAccount()
        )?.publicKey!,
        localStorage
      );

      //try to load your user profile
      try {
        const newUserProfile = await getUserProfile(userAddress, localStorage);
        setUserProfile(newUserProfile!);

        setUserProfiles(
          userProfiles.set(userAddress as address, newUserProfile!)
        );
      } catch (error) {
        console.warn(
          "User " +
            userAddress +
            " has no social account profile link on TzCommunity"
        );
      }

      replace(PAGES.SEARCH);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <IonButton color="dark" onClick={connectWallet}>
      <IonIcon icon={walletOutline} />
      <IonLabel>&nbsp; Login</IonLabel>
    </IonButton>
  );
};

export default ConnectButton;
