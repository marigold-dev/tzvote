import { IonButton, IonIcon, IonLabel } from "@ionic/react";
import { logOutOutline } from "ionicons/icons";
import React from "react";
import { useHistory } from "react-router";
import { PAGES, UserContext, UserContextType } from "../App";

const DisconnectButton = (): JSX.Element => {
  const {
    userAddress,
    setUserAddress,
    wallet,
    setBakerDelegators,
    setBakerPower,
  } = React.useContext(UserContext) as UserContextType;

  const { replace } = useHistory();
  const disconnectWallet = async (): Promise<void> => {
    setUserAddress(undefined);
    setBakerPower(0);
    setBakerDelegators(new Array<string>());
    console.log("disconnecting wallet");

    replace(PAGES.HOME);

    await wallet.clearActiveAccount();
  };

  return (
    <IonButton color="dark" onClick={disconnectWallet}>
      <IonIcon icon={logOutOutline} />
      <IonLabel>&nbsp; Logout {userAddress}</IonLabel>
    </IonButton>
  );
};

export default DisconnectButton;
