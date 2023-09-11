import { NetworkType } from "@airgap/beacon-sdk";
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonChip,
  IonCol,
  IonContent,
  IonFooter,
  IonGrid,
  IonHeader,
  IonIcon,
  IonImg,
  IonPage,
  IonRow,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { Tzip16Module } from "@taquito/tzip16";
import {
  albumsOutline,
  constructOutline,
  fileTrayFullOutline,
} from "ionicons/icons";
import React, { useState } from "react";
import { UserContext, UserContextType } from "../App";
import ConnectButton from "../components/ConnectWallet";
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

  /**
   * LANDING PAGE
   *  */
  let network =
    NetworkType[
      import.meta.env.VITE_NETWORK.toUpperCase() as keyof typeof NetworkType
    ];
  return (
    <IonPage className="container">
      <IonHeader>
        <IonToolbar>
          <IonChip color="transparent">
            <IonImg src="/logo_white.png" style={{ height: "30px" }} />
            <IonTitle>TzVote</IonTitle>
          </IonChip>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ionContentBg">
        {network != NetworkType.MAINNET ? (
          <div className="banner">WARNING: You are on {network}</div>
        ) : (
          <span />
        )}

        <IonContent style={{ "--background": "none", color: "primary" }}>
          <h1 style={{ paddingTop: "5vh" }}>Web3 voting app</h1>

          <ConnectButton />

          <IonGrid>
            <IonRow>
              <IonCol sizeSm="12" sizeXs="12" sizeMd="6" sizeXl="6">
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>
                      <IonIcon icon={albumsOutline}></IonIcon>
                      &nbsp;&nbsp; Create your own poll
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    TzVote helps you deploy your own smart contract and provides
                    you the UI to manage the vote session
                  </IonCardContent>
                </IonCard>
              </IonCol>
              <IonCol sizeSm="12" sizeXs="12" sizeMd="6" sizeXl="6">
                <IonCard style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
                  <IonCardHeader>
                    <IonCardTitle>
                      <IonIcon icon={fileTrayFullOutline}></IonIcon>
                      &nbsp;&nbsp; Several templates available
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <ul>
                      <li>
                        <b>permissioned vote </b> : invite voters, 1 voter = 1
                        vote
                      </li>
                      <li>
                        <b>baker vote</b> : all bakers can vote, weight based on
                        baker voting power{" "}
                      </li>
                    </ul>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol sizeSm="12" sizeXs="12" sizeMd="6" sizeXl="6">
                <IonCard style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
                  <IonCardHeader>
                    {" "}
                    <IonCardTitle>
                      <IonIcon icon={constructOutline}></IonIcon>
                      &nbsp;&nbsp; TzCommunity integration
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    Leverage Tezos social graph as user registry to pick your
                    voters ..
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonContent>
      </IonContent>
      <IonFooter>
        <IonToolbar>
          <IonRow>
            <IonCol>
              <a href="https://github.com/marigold-dev/tzvote" target="_blank">
                <IonImg
                  style={{ height: 30 }}
                  src="https://github.githubassets.com/images/modules/logos_page/Octocat.png"
                />
              </a>
            </IonCol>{" "}
            <IonCol>
              <a href="https://marigold.dev" target="_blank">
                <IonImg style={{ height: 30 }} src="/marigold.png" />
              </a>
            </IonCol>
          </IonRow>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default Home;
