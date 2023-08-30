import { NetworkType } from "@airgap/beacon-sdk";
import {
  IonActionSheet,
  IonButton,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonModal,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { Tzip16Module } from "@taquito/tzip16";
import { person } from "ionicons/icons";
import React, { useRef, useState } from "react";
import { UserContext, UserContextType } from "../App";
import ConnectButton from "../components/ConnectWallet";
import CreatePermissionedSimplePoll from "../components/CreatePermissionedSimplePoll";
import CreateTezosTemplate from "../components/CreateTezosTemplate";
import DisconnectButton from "../components/DisconnectWallet";
import { Search } from "../components/Search";
import { VOTING_TEMPLATE } from "../contractutils/TezosContractUtils";
import "./Home.css";

const Home: React.FC = () => {
  const { Tezos, wallet } = React.useContext(UserContext) as UserContextType;

  Tezos.addExtension(new Tzip16Module());
  const [publicToken, setPublicToken] = useState<string | null>("");
  const [userAddress, setUserAddress] = useState<string>("");
  const [userBalance, setUserBalance] = useState<number>(0);
  const [bakerDelegators, setBakerDelegators] = useState<string[]>(
    new Array<string>()
  );
  const [bakerPower, setBakerPower] = useState<number>(0);
  const [copiedPublicToken, setCopiedPublicToken] = useState<boolean>(false);
  const [beaconConnection, setBeaconConnection] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("search");

  /**CREATE BUTTON SECTION */
  const votingTemplateOptions = [
    VOTING_TEMPLATE.PERMISSIONEDSIMPLEPOLL.name,
    VOTING_TEMPLATE.TEZOSTEMPLATE.name,
  ];
  const [openVotingTemplateOptions, setOpenVotingTemplateOptions] =
    React.useState(false);
  const anchorRefVotingOptionsComboBox = React.useRef<HTMLDivElement>(null);
  const [
    selectedIndexVotingTemplateOption,
    setSelectedIndexVotingTemplateOption,
  ] = React.useState(0);

  const handleMenuItemVotingTemplateOptionsClick = (index: number) => {
    setSelectedIndexVotingTemplateOption(index);
    setOpenVotingTemplateOptions(false);
  };

  const handleToggleMenuItemVotingTemplateOptions = () => {
    setOpenVotingTemplateOptions((prevOpen) => !prevOpen);
  };

  const handleCloseMenuItemVotingTemplateOptions = (
    event: MouseEvent | TouchEvent
  ) => {
    if (
      anchorRefVotingOptionsComboBox.current &&
      anchorRefVotingOptionsComboBox.current.contains(event.target as Node)
    ) {
      return;
    }

    setOpenVotingTemplateOptions(false);
  };
  /** END OF CREATE BUTTON SECTION */

  /**
   * LANDING PAGE FIRST TIME
   *  */
  //console.log("firstTime",firstTime,"publicToken",publicToken,"userAddress",userAddress,"userBalance",userBalance);
  let network = import.meta.env.VITE_NETWORK
    ? NetworkType[
        import.meta.env.VITE_NETWORK.toUpperCase() as keyof typeof NetworkType
      ]
    : NetworkType.GHOSTNET;

  const modal = useRef<HTMLIonModalElement>(null);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Blank</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Blank</IonTitle>
          </IonToolbar>
        </IonHeader>
        <div className="main-box">
          {network != NetworkType.MAINNET ? (
            <div className="banner">WARNING: TEST ONLY {network}</div>
          ) : (
            <span />
          )}
          <IonContent
            style={{
              height: "6vh",
              display: "flex",
              backgroundColor: "var(--main-bg-color)",
              color: "white",
              justifyContent: "space-between",
              textAlign: "center",
              fontSize: "1.5em",
              padding: "0.2em",
            }}
          >
            <img className="logo" src="/logo_white.png" alt="marigold-button" />

            <IonButton
              style={{ marginRight: 0.5 }}
              id="search"
              onClick={() => setActiveTab("search")}
            >
              Search
            </IonButton>

            {userAddress ? (
              <>
                <IonButton id="anchorRefVotingOptionsComboBox">
                  Create a poll
                </IonButton>

                <IonActionSheet
                  trigger="anchorRefVotingOptionsComboBox"
                  header="Choose a template"
                  buttons={[
                    {
                      text: "Create permissioned voting template",
                      data: {
                        action: "delete",
                      },
                    },
                    {
                      text: "Create baker voting template",
                      data: {
                        action: "delete",
                      },
                    },
                    {
                      text: "Cancel",
                      role: "cancel",
                      data: {
                        action: "cancel",
                      },
                    },
                  ]}
                ></IonActionSheet>
              </>
            ) : (
              ""
            )}

            {userAddress ? (
              <>
                <IonButton id="open-modal" expand="block">
                  <IonIcon icon={person} />
                </IonButton>
                <IonModal ref={modal} trigger="open-modal">
                  <p>
                    <i className="far fa-address-card"></i>&nbsp; {userAddress}
                  </p>
                  <p>
                    <i className="fas fa-piggy-bank"></i>&nbsp;
                    {(userBalance / 1000000).toLocaleString("en-US")} ꜩ
                  </p>

                  {bakerDelegators.length > 0 ? (
                    <p>
                      <i className="fas fa-bolt"></i>&nbsp;
                      {bakerPower} from {bakerDelegators.length} delegators
                    </p>
                  ) : (
                    ""
                  )}

                  <hr></hr>
                  <DisconnectButton
                    wallet={wallet}
                    setPublicToken={setPublicToken}
                    setUserAddress={setUserAddress}
                    setUserBalance={setUserBalance}
                    setBakerDelegators={setBakerDelegators}
                    setBeaconConnection={setBeaconConnection}
                    setActiveTab={setActiveTab}
                  />
                </IonModal>
              </>
            ) : (
              <ConnectButton
                Tezos={Tezos}
                wallet={wallet}
                setPublicToken={setPublicToken}
                setUserAddress={setUserAddress}
                setUserBalance={setUserBalance}
                setBakerDelegators={setBakerDelegators}
                setBakerPower={setBakerPower}
                setBeaconConnection={setBeaconConnection}
              />
            )}
          </IonContent>
          <div id="dialog">
            <div id="content">
              {activeTab === "search" ? (
                <div id="search">
                  <h3 className="text-align-center">Search voting sessions</h3>
                  <Search />
                </div>
              ) : activeTab == VOTING_TEMPLATE.TEZOSTEMPLATE.name ? (
                <div>
                  <h3 className="text-align-center">
                    Create new {VOTING_TEMPLATE.TEZOSTEMPLATE.name} voting
                    session
                  </h3>
                  <CreateTezosTemplate
                    Tezos={Tezos}
                    userAddress={userAddress}
                  />
                </div>
              ) : (
                <div>
                  <h3 className="text-align-center">
                    Create new {VOTING_TEMPLATE.PERMISSIONEDSIMPLEPOLL.name}{" "}
                    voting session
                  </h3>
                  <CreatePermissionedSimplePoll
                    Tezos={Tezos}
                    userAddress={userAddress}
                    bakerDelegators={bakerDelegators}
                    setActiveTab={setActiveTab}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </IonContent>
      <IonFooter>
        <a href="https://github.com/marigold-dev/tzvote">
          <img
            height={15}
            src="https://github.githubassets.com/images/modules/logos_page/Octocat.png"
          />
          <img
            height={15}
            src="https://github.githubassets.com/images/modules/logos_page/GitHub-Logo.png"
          />
        </a>
        Marigold 2023
      </IonFooter>
    </IonPage>
  );
};

export default Home;
