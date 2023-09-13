import { IonButton, IonIcon, IonLabel } from "@ionic/react";
import { logOutOutline } from "ionicons/icons";
import React from "react";
import { useHistory } from "react-router";
import { PAGES, UserContext, UserContextType } from "../App";
import { address } from "../type-aliases";
import { TzCommunityIonicUserProfileChip } from "../tzcommunity/TzCommunityIonicUserProfileChip";
import TzCommunityReactContext, {
  TzCommunityReactContextType,
} from "../tzcommunity/TzCommunityReactContext";
import { LocalStorageKeys } from "../tzcommunity/TzCommunityUtils";

const DisconnectButton = (): JSX.Element => {
  const {
    userAddress,
    setUserAddress,
    wallet,
    setBakerDelegators,
    setBakerPower,
  } = React.useContext(UserContext) as UserContextType;

  const { localStorage, userProfiles } = React.useContext(
    TzCommunityReactContext
  ) as TzCommunityReactContextType;

  const { replace } = useHistory();

  const disconnectWallet = async (): Promise<void> => {
    setUserAddress(undefined);
    setBakerPower(0);
    setBakerDelegators(new Array<string>());

    //TzCommunity
    if (localStorage.initialized) {
      console.log("localStorage is initialized, removing access tokens");
      await localStorage.remove(LocalStorageKeys.access_token); //remove SIWT tokens
      await localStorage.remove(LocalStorageKeys.id_token); //remove SIWT tokens
      await localStorage.remove(LocalStorageKeys.refresh_token); //remove SIWT tokens
    } else {
      console.warn("localStorage not initialized, cannot remove access tokens");
    }
    //End TzCommunity
    console.log("disconnecting wallet");

    replace(PAGES.HOME);

    await wallet.clearActiveAccount();
  };

  return (
    <IonButton color="dark" onClick={disconnectWallet}>
      <IonIcon icon={logOutOutline} />
      <IonLabel>
        &nbsp; Logout{" "}
        <TzCommunityIonicUserProfileChip
          color="light"
          userProfiles={userProfiles}
          address={userAddress as address}
          key={userAddress as address}
        ></TzCommunityIonicUserProfileChip>
      </IonLabel>
    </IonButton>
  );
};

export default DisconnectButton;
