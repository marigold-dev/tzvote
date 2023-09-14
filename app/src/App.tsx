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
import { Storage as LocalStorage } from "@ionic/storage";
import { BeaconWallet } from "@taquito/beacon-wallet";
import { DelegatesResponse } from "@taquito/rpc";
import { TezosToolkit } from "@taquito/taquito";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import CreatePermissionedSimplePoll from "./components/CreatePermissionedSimplePoll";
import CreateTezosTemplate from "./components/CreateTezosTemplate";
import { Results } from "./components/Results";
import { Search } from "./components/Search";
import { Settings } from "./components/Settings";
import { VOTING_TEMPLATE } from "./contractutils/TezosUtils";
import "./theme/variables.css";
import { address } from "./type-aliases";

import {
  CachingService,
  LocalStorageKeys,
  TzCommunityError,
  TzCommunityErrorType,
  UserProfile,
  connectToWeb2Backend,
  getUserProfile,
  loadUserProfiles,
  refreshToken,
} from "@marigold-dev/tezos-community";
import { TzCommunityReactContext } from "@marigold-dev/tezos-community-reactcontext";

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

  reloadUser: () => Promise<string | undefined>;

  BLOCK_TIME: number;
};

export const UserContext = React.createContext<UserContextType | null>(null);

const App: React.FC = () => {
  const Tezos = new TezosToolkit(
    "https://" + import.meta.env.VITE_NETWORK + ".tezos.marigold.dev"
  );
  const [BLOCK_TIME, setBLOCK_TIME] = useState<number>(15);
  const wallet = new BeaconWallet({
    name: "TzVote",
    preferredNetwork:
      NetworkType[
        import.meta.env.VITE_NETWORK.toUpperCase() as keyof typeof NetworkType
      ],
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

    await wallet.clearActiveAccount();

    window.location.href = PAGES.HOME;
  };

  const reloadUser = async (): Promise<string | undefined> => {
    const activeAccount = await wallet.client.getActiveAccount();

    if (activeAccount) {
      let userAddress = activeAccount!.address;
      setUserAddress(userAddress);

      console.log("userAddress", userAddress);

      //update baker power
      try {
        const delegatesResponse: DelegatesResponse =
          await Tezos.rpc.getDelegates(userAddress);

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

      //try to load your user profile
      try {
        const newUserProfile = await getUserProfile(userAddress, localStorage);
        setUserProfile(newUserProfile!);

        setUserProfiles(
          userProfiles.set(userAddress as address, newUserProfile!)
        );
      } catch (error) {
        if (error instanceof TzCommunityError) {
          switch (error.type) {
            case TzCommunityErrorType.ACCESS_TOKEN_NULL: {
              console.warn("Cannot refresh token, disconnect");
              disconnectWallet();
              break;
            }
            case TzCommunityErrorType.ACCESS_TOKEN_EXPIRED: {
              console.warn(
                "Access token expired, try to fetch from refresh token.."
              );
              await refreshToken(userAddress!, localStorage);
              const userProfile = await getUserProfile(
                userAddress!,
                localStorage
              );
              if (userProfile) setUserProfile(userProfile);
              setUserProfiles(
                await loadUserProfiles(Tezos, userAddress!, localStorage)
              );
              break;
            }
          }
        } else {
          console.warn(
            "User " +
              userAddress +
              " has no social account profile link on TzCommunity"
          );
        }
      }

      return userAddress;
    } else {
      return undefined;
    }
  };

  useEffect(() => {
    (async () => {
      const constantsResponse = await Tezos.rpc.getConstants();
      setBLOCK_TIME(constantsResponse.minimal_block_delay!.toNumber() * 1000);
    })();

    //TzCommunity
    (async () => {
      await localStorage.initStorage();
    })();
    //End TzCommunity
  }, []);

  //tzCommunity
  const [userProfiles, setUserProfiles] = useState<Map<address, UserProfile>>(
    new Map()
  );

  const [userProfile, setUserProfile] = useState<UserProfile | undefined>();
  const [localStorage, setLocalStorage] = useState<CachingService>(
    new CachingService(new LocalStorage())
  );

  useEffect(() => {
    //only try to load if userProfile, it means you are logged with TzCommunity
    (async () => {
      if (userProfile || userProfile === null) {
        try {
          setUserProfiles(
            await loadUserProfiles(Tezos, userAddress!, localStorage)
          );
        } catch (error) {
          console.log(error);

          if (error instanceof TzCommunityError) {
            switch (error.type) {
              case TzCommunityErrorType.ACCESS_TOKEN_NULL: {
                console.warn("Cannot refresh token, disconnect");
                disconnectWallet();
                break;
              }
              case TzCommunityErrorType.ACCESS_TOKEN_EXPIRED: {
                console.warn(
                  "Access token expired, try to fetch from refresh token.."
                );
                await refreshToken(userAddress!, localStorage);
                const userProfile = await getUserProfile(
                  userAddress!,
                  localStorage
                );
                if (userProfile) setUserProfile(userProfile);
                setUserProfiles(
                  await loadUserProfiles(Tezos, userAddress!, localStorage)
                );
                break;
              }
            }
          } else {
            //nada
          }
        }
      } else {
        //nada
      }
    })();
  }, [userProfile]);

  //end tzCommunity

  return (
    <IonApp>
      {" "}
      <TzCommunityReactContext.Provider
        value={{
          userProfiles,
          setUserProfiles,
          userProfile,
          setUserProfile,
          localStorage,
          connectToWeb2Backend: connectToWeb2Backend,
        }}
      >
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
            BLOCK_TIME,
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
              <Route
                path={`${PAGES.SETTINGS}/:type/:id`}
                component={Settings}
              />
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
      </TzCommunityReactContext.Provider>
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
