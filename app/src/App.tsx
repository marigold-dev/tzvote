import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Redirect, Route } from "react-router-dom";
import Home from "./pages/Home";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/display.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";

/* Theme variables */
import { NetworkType } from "@airgap/beacon-types";
import { BeaconWallet } from "@taquito/beacon-wallet";
import { DelegatesResponse } from "@taquito/rpc";
import { TezosToolkit } from "@taquito/taquito";
import React, { Dispatch, SetStateAction, useState } from "react";
import CreatePermissionedSimplePoll from "./components/CreatePermissionedSimplePoll";
import CreateTezosTemplate from "./components/CreateTezosTemplate";
import { Results } from "./components/Results";
import { Search } from "./components/Search";
import { Settings } from "./components/Settings";
import { VOTING_TEMPLATE } from "./contractutils/TezosContractUtils";
import "./theme/variables.css";

setupIonicReact();

export type UserContextType = {
  Tezos: TezosToolkit;
  userAddress: string | undefined;
  setUserAddress: Dispatch<SetStateAction<string | undefined>>;
  wallet: BeaconWallet;
  votingTemplateAddresses: Map<VOTING_TEMPLATE, string>;
  setVotingTemplateAddresses: Dispatch<
    SetStateAction<Map<VOTING_TEMPLATE, string>>
  >;
  bakerPower: number;
  setBakerPower: Dispatch<SetStateAction<number>>;
  bakerDelegators: string[];
  setBakerDelegators: Dispatch<SetStateAction<string[]>>;

  bakerDeactivated: boolean;
  setBakerDeactivated: Dispatch<SetStateAction<boolean>>;

  reloadUser: () => Promise<void>;
};

export const UserContext = React.createContext<UserContextType | null>(null);

const App: React.FC = () => {
  const Tezos = new TezosToolkit("https://ghostnet.tezos.marigold.dev");

  const wallet = new BeaconWallet({
    name: "TzVote",
    preferredNetwork: import.meta.env.VITE_NETWORK
      ? NetworkType[
          import.meta.env.VITE_NETWORK.toUpperCase() as keyof typeof NetworkType
        ]
      : NetworkType.GHOSTNET,
  });
  Tezos.setWalletProvider(wallet);
  const [userAddress, setUserAddress] = useState<string | undefined>();
  const [bakerPower, setBakerPower] = useState<number>(0);
  const [bakerDelegators, setBakerDelegators] = useState<string[]>([]);

  const [bakerDeactivated, setBakerDeactivated] = useState<boolean>(true);

  const [votingTemplateAddresses, setVotingTemplateAddresses] = useState<
    Map<VOTING_TEMPLATE, string>
  >(
    new Map([
      [
        VOTING_TEMPLATE.TEZOSTEMPLATE,
        import.meta.env.VITE_TEMPLATE_ADDRESS_TEZOSTEMPLATE!,
      ],
      [
        VOTING_TEMPLATE.PERMISSIONEDSIMPLEPOLL,
        import.meta.env.VITE_TEMPLATE_ADDRESS_PERMISSIONEDSIMPLEPOLL,
      ],
    ])
  );

  const reloadUser = async (): Promise<void> => {
    console.log("Reload user ********");

    const activeAccount = await wallet.client.getActiveAccount();
    let userAddress = activeAccount!.address;
    setUserAddress(userAddress);

    console.log("userAddress", userAddress);

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

  return (
    <IonApp>
      {" "}
      <UserContext.Provider
        value={{
          Tezos,
          userAddress,
          setUserAddress,
          wallet,
          votingTemplateAddresses,
          setVotingTemplateAddresses,
          bakerPower,
          setBakerPower,
          bakerDelegators,
          setBakerDelegators,
          reloadUser,
          bakerDeactivated,
          setBakerDeactivated,
        }}
      >
        <IonReactRouter>
          <IonRouterOutlet>
            <Route exact path={PAGES.HOME}>
              <Home />
            </Route>
            <Route exact path={PAGES.SEARCH}>
              <Search />
            </Route>
            <Route path={`${PAGES.RESULTS}/:type/:id`} component={Results} />
            <Route path={`${PAGES.SETTINGS}/:type/:id`} component={Settings} />
            <Route exact path={PAGES.CreatePermissionedSimplePoll}>
              <CreatePermissionedSimplePoll />
            </Route>
            <Route exact path={PAGES.CreateTezosTemplate}>
              <CreateTezosTemplate />
            </Route>
            <Route exact path="/">
              <Redirect to="/home" />
            </Route>
          </IonRouterOutlet>
        </IonReactRouter>
      </UserContext.Provider>
    </IonApp>
  );
};

export default App;

export enum PAGES {
  SEARCH = "/search",
  HOME = "/home",
  RESULTS = "/results",
  SETTINGS = "/settings",
  CreatePermissionedSimplePoll = "/createPermissionedSimplePoll",
  CreateTezosTemplate = "/createTezosTemplate",
}
