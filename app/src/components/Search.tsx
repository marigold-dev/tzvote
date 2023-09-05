import { NetworkType } from "@airgap/beacon-sdk";
import {
  IonAvatar,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonChip,
  IonContent,
  IonFab,
  IonFabButton,
  IonFabList,
  IonFooter,
  IonHeader,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonModal,
  IonPage,
  IonProgressBar,
  IonRadio,
  IonRadioGroup,
  IonRefresher,
  IonRefresherContent,
  IonRow,
  IonSearchbar,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  RefresherEventDetail,
  useIonAlert,
} from "@ionic/react";

import { Contract } from "@tzkt/sdk-api";
//import * as moment from "moment";
import moment from "moment";
import momentDurationFormatSetup from "moment-duration-format";
import React, { useRef, useState } from "react";
import {
  VOTING_TEMPLATE,
  VotingContract,
  VotingContractUtils,
  userCanVoteNow,
} from "../contractutils/TezosContractUtils";
import {
  STATUS,
  TransactionInvalidBeaconError,
} from "../contractutils/TezosUtils";

import { PermissionedSimplePollWalletType } from "../permissionedSimplePoll.types";

import { TezosTemplate3WalletType } from "../tezosTemplate3.types";

import * as api from "@tzkt/sdk-api";
import {
  addCircleOutline,
  barChartOutline,
  lockClosedOutline,
  personCircleOutline,
  settingsOutline,
  syncCircleOutline,
} from "ionicons/icons";
import { useHistory } from "react-router";
import { PAGES, UserContext, UserContextType } from "../App";
import { address, key_hash } from "../type-aliases";
import DisconnectButton from "./DisconnectWallet";

momentDurationFormatSetup(moment);

export const Search: React.FC = () => {
  api.defaults.baseUrl =
    "https://api." + import.meta.env.VITE_NETWORK + ".tzkt.io";

  const {
    Tezos,
    votingTemplateAddresses,
    userAddress,
    bakerPower,

    reloadUser,
  } = React.useContext(UserContext) as UserContextType;

  const [presentAlert] = useIonAlert();
  const { push } = useHistory();

  //SEARCH
  const [options, setOptions] = useState<Array<string>>([]);
  const [inputValue, setInputValue] = React.useState<string>("");

  //LIST
  const [allContracts, setAllContracts] = useState<Array<VotingContract>>([]);
  const [contracts, setContracts] = useState<Array<VotingContract>>([]);

  //TEZOS OPERATIONS
  const [loading, setLoading] = React.useState(false);

  const refreshData = (event?: CustomEvent<RefresherEventDetail>) => {
    (async () => {
      let allTEZOSTEMPLATEContractFromTzkt: Array<Contract> =
        await api.contractsGetSame(
          votingTemplateAddresses.get(VOTING_TEMPLATE.TEZOSTEMPLATE)!,
          {
            sort: { desc: "id" },
          }
        );

      let allPERMISSIONEDSIMPLEPOLLContractFromTzkt: Array<Contract> =
        await api.contractsGetSame(
          votingTemplateAddresses.get(VOTING_TEMPLATE.PERMISSIONEDSIMPLEPOLL)!,
          {
            sort: { desc: "id" },
          }
        );

      let allConvertertedTEZOSTEMPLATEContractContracts: Array<VotingContract> =
        await Promise.all(
          allTEZOSTEMPLATEContractFromTzkt.map(
            async (tzktObject: Contract) =>
              await VotingContractUtils.convertFromTZKTTezosContractToTezosTemplateVotingContract(
                Tezos,
                tzktObject
              )
          )
        );

      let allConvertertedPERMISSIONEDSIMPLEPOLLContractContracts: Array<VotingContract> =
        await Promise.all(
          allPERMISSIONEDSIMPLEPOLLContractFromTzkt.map(
            async (tzktObject: Contract) =>
              await VotingContractUtils.convertFromTZKTTezosContractToPermissionnedSimplePollTemplateVotingContract(
                Tezos,
                tzktObject
              )
          )
        );
      setAllContracts([
        ...allConvertertedTEZOSTEMPLATEContractContracts,
        ...allConvertertedPERMISSIONEDSIMPLEPOLLContractContracts,
      ]);
      setOptions(
        Array.from(
          new Set(
            [
              ...allConvertertedTEZOSTEMPLATEContractContracts,
              ...allConvertertedPERMISSIONEDSIMPLEPOLLContractContracts,
            ].map((c: VotingContract) => c.name)
          )
        )
      );

      event?.detail.complete();
    })();
  };

  const filterOnNewInput = (filterValue: string | null) => {
    if (filterValue == null || filterValue === "") setContracts([]);
    else {
      let filteredContract = allContracts.filter((c: VotingContract) => {
        //console.log(filterValue.replace(/[^a-zA-Z0-9]/gi, ".")); //avoid issue of special char on the regex
        return (
          c.name.search(
            new RegExp(filterValue.replace(/[^a-zA-Z0-9]/gi, "."), "gi")
          ) >= 0
        );
      });

      //console.log("filteredContract", filteredContract);

      setContracts(filteredContract);
    }
  };

  //EFFECTS
  React.useEffect(() => {
    //in case of forced page refresh
    if (!userAddress) {
      (async () => {
        await reloadUser();
      })();
    }

    refreshData();
  }, []); //init load

  React.useEffect(() => {
    setInputValue("*");
    filterOnNewInput(inputValue);
  }, [allContracts]); //if data refreshed, need to refresh the filtered list too

  const durationToString = (value: number): string => {
    return moment
      .duration(value, "milliseconds")
      .format("d [days] hh:mm:ss left");
  };

  /*************************************/
  // *********** BUTTON ACTION AREA ******
  /*************************************/

  //vote popup
  const votePopup = useRef<HTMLIonModalElement>(null);

  //vote button
  const [voteValue, setVoteValue] = React.useState("");

  const handleVoteSubmit = async (contract: VotingContract) => {
    setLoading(true);

    if (voteValue !== "") {
      try {
        if (contract.type == VOTING_TEMPLATE.PERMISSIONEDSIMPLEPOLL) {
          const c = await Tezos.wallet.at<PermissionedSimplePollWalletType>(
            contract.address
          );

          const op = await c.methods.vote(voteValue).send();
          await op.confirmation();

          //refresh info on list
          setTimeout(() => {
            console.log("the list will refresh soon");
            refreshData();
            filterOnNewInput(inputValue);
          }, 2000);

          presentAlert({
            header: "Success",
            message: "Your vote has been accepted (wait a bit the refresh)",
          });
        } else if (contract.type == VOTING_TEMPLATE.TEZOSTEMPLATE) {
          const c = await Tezos.wallet.at<TezosTemplate3WalletType>(
            contract.address
          );

          const pkh = await Tezos.wallet.pkh();
          const op = await c.methods.default(voteValue, pkh as key_hash).send();
          await op.confirmation();

          //refresh info on list
          setTimeout(() => {
            console.log("the list will refresh soon");
            refreshData();
            filterOnNewInput(inputValue);
          }, 2000);

          presentAlert({
            header: "Success",
            message: "Your vote has been accepted (wait a bit the refresh)",
          });
        } else {
          console.error("Cannot find the type for contract ", contract);

          throw new Error(
            "Cannot find the type for contract " + contract.address
          );
        }
      } catch (error: any) {
        console.table(`Error: ${JSON.stringify(error, null, 2)}`);
        let tibe: TransactionInvalidBeaconError =
          new TransactionInvalidBeaconError(error);
        presentAlert({
          header: "Error",
          message: tibe.data_message,
        });
      } finally {
        setLoading(false);
      }
    } else {
      console.log("Please select an option.");
    }

    setLoading(false);
  };

  const buttonChoices = (contract: VotingContract) => {
    if (contract)
      return (
        <>
          {userCanVoteNow(contract, userAddress as address, bakerPower) ? (
            <>
              <IonButton id={"votePopupId" + contract.address} color="dark">
                <IonIcon icon="/voting.svg"></IonIcon>
                <IonLabel>VOTE</IonLabel>
              </IonButton>

              <IonModal
                className="container"
                trigger={"votePopupId" + contract.address}
                ref={votePopup}
              >
                <IonHeader>
                  <IonToolbar>
                    <IonButtons slot="start">
                      <IonButton onClick={() => votePopup.current?.dismiss()}>
                        Cancel
                      </IonButton>
                    </IonButtons>
                    <IonTitle>Vote</IonTitle>
                    <IonButtons slot="end">
                      <IonButton onClick={() => handleVoteSubmit(contract)}>
                        Confirm
                      </IonButton>
                    </IonButtons>
                  </IonToolbar>
                </IonHeader>
                <IonContent className="ion-padding">
                  <IonItem>
                    <IonLabel>Options</IonLabel>
                    <IonRadioGroup
                      name="radio-buttons-group"
                      value={voteValue}
                      onIonChange={(e) => setVoteValue(e.target.value)}
                    >
                      {contract.options.map((option: string) => (
                        <IonRadio key={option} value={option}>
                          {option}
                        </IonRadio>
                      ))}
                    </IonRadioGroup>
                  </IonItem>
                </IonContent>
              </IonModal>
            </>
          ) : (
            ""
          )}
        </>
      );
    else return <></>;
  };

  /*************************************/
  /***  MAIN FRAME *******************
   *************************************/
  return (
    <IonPage className="container">
      {loading ? (
        <div className="spin">
          <IonSpinner name="lines-sharp" color="primary" />
        </div>
      ) : (
        <>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Search</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent fullscreen>
            <IonRefresher slot="fixed" onIonRefresh={refreshData}>
              <IonRefresherContent></IonRefresherContent>
            </IonRefresher>

            <IonSearchbar
              animated
              debounce={1000}
              id="searchInput"
              placeholder="Filter here ..."
              value={inputValue}
              onIonChange={(e) => {
                let inputValue = e.target.value;
                if (
                  inputValue === undefined ||
                  !inputValue ||
                  inputValue === ""
                ) {
                  inputValue = "*";
                }

                setInputValue(inputValue); //search all

                filterOnNewInput(inputValue); //filter
              }}
            />

            {contracts.length === 0 ? (
              <IonTitle> No results ...</IonTitle>
            ) : (
              contracts.map((contract, _) => (
                <IonCard key={contract.address}>
                  <IonCardHeader>
                    <IonCardTitle>
                      <IonRow>
                        <IonText>{contract.name}</IonText>
                        <IonAvatar style={{ height: "20px", width: "20px" }}>
                          <IonImg
                            alt="Silhouette of a person's head"
                            src={
                              contract.type.name ==
                              VOTING_TEMPLATE.PERMISSIONEDSIMPLEPOLL.name
                                ? "/permissioned.png"
                                : "/baker.png"
                            }
                          />
                        </IonAvatar>

                        <IonIcon
                          color={
                            contract.status === STATUS.ONGOING
                              ? "success"
                              : "danger"
                          }
                          icon={
                            contract.status === STATUS.ONGOING
                              ? syncCircleOutline
                              : lockClosedOutline
                          }
                        ></IonIcon>
                      </IonRow>
                    </IonCardTitle>
                    <IonCardSubtitle style={{ textAlign: "left" }}>
                      {" "}
                      <IonChip
                        style={{
                          fontSize: "x-small",
                        }}
                      >
                        <IonIcon icon={personCircleOutline}></IonIcon>
                        <IonLabel>
                          <a
                            href={
                              `https://` +
                              (import.meta.env.VITE_NETWORK
                                ? NetworkType[
                                    import.meta.env[
                                      "VITE_NETWORK"
                                    ].toUpperCase() as keyof typeof NetworkType
                                  ]
                                : NetworkType.GHOSTNET) +
                              `.tzkt.io/${contract.creator}/info`
                            }
                            target="_blank"
                          >
                            {contract.creator}
                          </a>
                        </IonLabel>
                      </IonChip>
                    </IonCardSubtitle>
                  </IonCardHeader>

                  <IonCardContent>
                    <IonRow>
                      {buttonChoices(contract)}

                      <IonButton
                        color="dark"
                        onClick={() =>
                          push(
                            PAGES.RESULTS +
                              "/" +
                              contract.type.name +
                              "/" +
                              contract.address
                          )
                        }
                      >
                        <IonIcon icon={barChartOutline}></IonIcon>
                        <IonLabel>&nbsp; Results</IonLabel>
                      </IonButton>

                      {contract.creator === userAddress &&
                      contract.type ===
                        VOTING_TEMPLATE.PERMISSIONEDSIMPLEPOLL ? (
                        <IonButton
                          color="dark"
                          onClick={() =>
                            push(
                              PAGES.SETTINGS +
                                "/" +
                                contract.type.name +
                                "/" +
                                contract.address
                            )
                          }
                        >
                          <IonIcon icon={settingsOutline}></IonIcon>
                          <IonLabel>&nbsp; Settings</IonLabel>
                        </IonButton>
                      ) : (
                        ""
                      )}
                    </IonRow>
                  </IonCardContent>

                  {contract.status === STATUS.ONGOING ? (
                    <>
                      <IonProgressBar
                        title="Period"
                        key={`slider-${contract.address}`}
                        value={
                          (new Date().getTime() -
                            new Date(contract.from).getTime()) /
                          (new Date(contract.to).getTime() -
                            new Date(contract.from).getTime())
                        }
                      />
                      {durationToString(
                        new Date(contract.to).getTime() - Date.now()
                      )}
                    </>
                  ) : (
                    ""
                  )}
                </IonCard>
              ))
            )}

            <IonFab slot="fixed" vertical="bottom" horizontal="end">
              <IonFabButton>
                <IonIcon icon={addCircleOutline}></IonIcon>
              </IonFabButton>
              <IonFabList side="top">
                <IonFabButton onClick={() => push(PAGES.CreateTezosTemplate)}>
                  <IonAvatar style={{ height: "20px", width: "20px" }}>
                    <IonImg src="/baker.png" />
                  </IonAvatar>
                </IonFabButton>
                <IonFabButton
                  onClick={() => push(PAGES.CreatePermissionedSimplePoll)}
                >
                  <IonAvatar style={{ height: "20px", width: "20px" }}>
                    <IonImg src="/permissioned.png" />
                  </IonAvatar>
                </IonFabButton>
              </IonFabList>
            </IonFab>
          </IonContent>
          <IonFooter>
            <IonToolbar>
              <DisconnectButton />
            </IonToolbar>
          </IonFooter>
        </>
      )}
    </IonPage>
  );
};
