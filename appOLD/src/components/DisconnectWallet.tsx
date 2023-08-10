import { BeaconWallet } from "@taquito/beacon-wallet";
import { TezosToolkit } from "@taquito/taquito";
import { Dispatch, SetStateAction } from "react";

interface ButtonProps {
  wallet: BeaconWallet;
  setPublicToken: Dispatch<SetStateAction<string | null>>;
  setUserAddress: Dispatch<SetStateAction<string>>;
  setUserBalance: Dispatch<SetStateAction<number>>;
  setBakerDelegators: Dispatch<SetStateAction<string[]>>;
  setWallet: Dispatch<SetStateAction<any>>;
  setTezos: Dispatch<SetStateAction<TezosToolkit>>;
  setBeaconConnection: Dispatch<SetStateAction<boolean>>;
  setActiveTab: Dispatch<SetStateAction<string>>;
}

const DisconnectButton = ({
  wallet,
  setPublicToken,
  setUserAddress,
  setUserBalance,
  setBakerDelegators,
  setWallet,
  setTezos,
  setBeaconConnection,
  setActiveTab,
}: ButtonProps): JSX.Element => {
  const disconnectWallet = async (): Promise<void> => {
    //window.localStorage.clear();
    setUserAddress("");
    setUserBalance(0);
    setBakerDelegators(new Array<string>());
    setBeaconConnection(false);
    setPublicToken(null);
    setActiveTab("search"); //only possible option
    console.log("disconnecting wallet");
    await wallet.clearActiveAccount();
  };

  return (
    <div className="buttons">
      <button className="button" onClick={disconnectWallet}>
        <i className="fas fa-times"></i>&nbsp; Disconnect wallet
      </button>
    </div>
  );
};

export default DisconnectButton;
