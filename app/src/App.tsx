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
import { TezosToolkit } from "@taquito/taquito";
import React, { Dispatch, SetStateAction, useState } from "react";
import CreatePermissionedSimplePoll from "./components/CreatePermissionedSimplePoll";
import CreateTezosTemplate from "./components/CreateTezosTemplate";
import { Results } from "./components/Results";
import { Search } from "./components/Search";
import { VOTING_TEMPLATE } from "./contractutils/TezosContractUtils";
import "./theme/variables.css";

setupIonicReact();

export type UserContextType = {
  Tezos: TezosToolkit;
  userAddress: string;
  setUserAddress: Dispatch<SetStateAction<string>>;
  wallet: BeaconWallet;
  votingTemplateAddresses: Map<VOTING_TEMPLATE, string>;
  setVotingTemplateAddresses: Dispatch<
    SetStateAction<Map<VOTING_TEMPLATE, string>>
  >;
  bakerPower: number;
  setBakerPower: Dispatch<SetStateAction<number>>;
  bakerDelegators: string[];
  setBakerDelegators: Dispatch<SetStateAction<string[]>>;
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
  const [userAddress, setUserAddress] = useState<string>("");
  const [bakerPower, setBakerPower] = useState<number>(0);
  const [bakerDelegators, setBakerDelegators] = useState<string[]>([]);

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
  CreatePermissionedSimplePoll = "/createPermissionedSimplePoll",
  CreateTezosTemplate = "/createTezosTemplate",
}
