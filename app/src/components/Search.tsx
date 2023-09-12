import { NetworkType } from "@airgap/beacon-sdk";
import { Share } from "@capacitor/share";
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
  IonCol,
  IonContent,
  IonFab,
  IonFabButton,
  IonFabList,
  IonFooter,
  IonGrid,
  IonHeader,
  IonIcon,
  IonImg,
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
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  IonTitle,
  IonToggle,
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
  STATUS,
  TransactionInvalidBeaconError,
  VOTING_TEMPLATE,
  VotingContract,
  convertFromTZKTTezosContractToPermissionnedSimplePollTemplateVotingContract,
  convertFromTZKTTezosContractToTezosTemplateVotingContract,
  userCanVoteNow,
} from "../contractutils/TezosUtils";

import { PermissionedSimplePollWalletType } from "../permissionedSimplePoll.types";

import { TezosTemplate3WalletType } from "../tezosTemplate3.types";

import { Capacitor } from "@capacitor/core";
import * as api from "@tzkt/sdk-api";
import {
  addCircleOutline,
  barChartOutline,
  eyeOutline,
  lockClosedOutline,
  lockOpenOutline,
  personCircleOutline,
  settingsOutline,
  shareSocialOutline,
} from "ionicons/icons";
import { useHistory } from "react-router";
import { PAGES, UserContext, UserContextType } from "../App";
import { address, key_hash } from "../type-aliases";
import ConnectButton from "./ConnectWallet";
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
    bakerDeactivated,
    reloadUser,
    BLOCK_TIME,
  } = React.useContext(UserContext) as UserContextType;

  const [presentAlert] = useIonAlert();
  const { push } = useHistory();

  //FILTERS
  type Filter = {
    inputValue: string;
    votableOnly: boolean;
    openOnly: boolean;
    mineOnly: boolean;
    template: string[];
    newerThan2Weeks: boolean;
  };

  const [filter, setFilter] = React.useState<Filter>({
    inputValue: "*",
    votableOnly: false,
    openOnly: false,
    mineOnly: false,
    template: [],
    newerThan2Weeks: true,
  });

  //LIST
  const [allContracts, setAllContracts] = useState<Array<VotingContract>>([]);
  const [contracts, setContracts] = useState<Array<VotingContract>>([]);

  //TEZOS OPERATIONS
  const [loading, setLoading] = React.useState(false);

  const refreshData = async (event?: CustomEvent<RefresherEventDetail>) => {
    (async () => {
      let allTEZOSTEMPLATEContractFromTzkt: Array<Contract> =
        await api.contractsGetSame(
          votingTemplateAddresses.get(VOTING_TEMPLATE.TEZOSTEMPLATE)!,
          {
            includeStorage: true,
            sort: { desc: "id" },
          }
        );

      let allPERMISSIONEDSIMPLEPOLLContractFromTzkt: Array<Contract> =
        await api.contractsGetSame(
          votingTemplateAddresses.get(VOTING_TEMPLATE.PERMISSIONEDSIMPLEPOLL)!,
          {
            includeStorage: true,

            sort: { desc: "id" },
          }
        );

      let allConvertertedTEZOSTEMPLATEContractContracts: Array<VotingContract> =
        await Promise.all(
          allTEZOSTEMPLATEContractFromTzkt.map(
            async (tzktObject: Contract) =>
              await convertFromTZKTTezosContractToTezosTemplateVotingContract(
                Tezos,
                tzktObject
              )
          )
        );

      let allConvertertedPERMISSIONEDSIMPLEPOLLContractContracts: Array<VotingContract> =
        await Promise.all(
          allPERMISSIONEDSIMPLEPOLLContractFromTzkt.map(
            async (tzktObject: Contract) =>
              await convertFromTZKTTezosContractToPermissionnedSimplePollTemplateVotingContract(
                Tezos,
                tzktObject
              )
          )
        );
      setAllContracts([
        ...allConvertertedTEZOSTEMPLATEContractContracts,
        ...allConvertertedPERMISSIONEDSIMPLEPOLLContractContracts,
      ]);

      event?.detail.complete();

      console.log("refreshData DONE", allContracts);
    })();
  };

  const filterContracts = (newFilter: Filter) => {
    //console.log("filteredContract srtas", allContracts);
    let filteredContract = allContracts;
    //input value
    if (
      newFilter.inputValue &&
      newFilter.inputValue !== "" &&
      newFilter.inputValue !== "*"
    ) {
      filteredContract = filteredContract.filter((c: VotingContract) => {
        //console.log(filterValue.replace(/[^a-zA-Z0-9]/gi, ".")); //avoid issue of special char on the regex
        return (
          c.name.search(
            new RegExp(
              newFilter.inputValue.replace(/[^a-zA-Z0-9]/gi, "."),
              "gi"
            )
          ) >= 0
        );
      });
    }

    //votable
    if (newFilter.votableOnly) {
      filteredContract = filteredContract.filter((c: VotingContract) =>
        userCanVoteNow(c, userAddress! as address, bakerPower, bakerDeactivated)
      );
    }

    //open
    if (newFilter.openOnly) {
      filteredContract = filteredContract.filter(
        (c: VotingContract) => c.status === STATUS.ONGOING
      );
    }

    //mine
    if (newFilter.mineOnly) {
      filteredContract = filteredContract.filter(
        (c: VotingContract) => c.creator === userAddress
      );
    }

    //template
    if (newFilter.template && newFilter.template.length > 0) {
      filteredContract = filteredContract.filter(
        (c: VotingContract) => newFilter.template.indexOf(c.type.name) >= 0
      );
      /* console.log(
        filteredContract,
        "After filteredContract",
        newFilter.template
      );*/
    }

    //newerThan2Weeks
    if (newFilter.newerThan2Weeks) {
      filteredContract = filteredContract.filter((c: VotingContract) => {
        const diff = new Date().getTime() - new Date(c.to).getTime();

        //diff less than  2 weeks
        if (diff <= 0 || Math.abs(diff) < 1000 * 60 * 60 * 24 * 7 * 2) {
          return true;
        } else {
          return false;
        }
      });
    }

    setContracts(filteredContract);
  };

  //EFFECTS
  React.useEffect(() => {
    //in case of forced page refresh
    if (!userAddress) {
      (async () => {
        await reloadUser();
      })();
    }

    (async () => {
      await refreshData();
      console.log("Search - refreshData");
    })();
  }, []); //init load

  React.useEffect(() => {
    filterContracts(filter);
    console.log(
      "Search - filterContracts",
      "if data refreshed, need to refresh the filtered list too"
    );
  }, [allContracts]);

  const durationToString = (value: number): string => {
    return moment
      .duration(value, "milliseconds")
      .format("d [days] hh:mm:ss left");
  };

  /***/
  // ** BUTTON ACTION AREA **
  /***/

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
          setTimeout(async () => {
            await refreshData();
            setLoading(false);
            filterContracts(filter);
            presentAlert({
              header: "Success",
              message: "Your vote has been accepted",
            });
          }, BLOCK_TIME);
        } else if (contract.type == VOTING_TEMPLATE.TEZOSTEMPLATE) {
          const c = await Tezos.wallet.at<TezosTemplate3WalletType>(
            contract.address
          );

          const pkh = await Tezos.wallet.pkh();
          const op = await c.methods.default(voteValue, pkh as key_hash).send();
          await op.confirmation();

          //refresh info on list
          setTimeout(async () => {
            await refreshData();
            setLoading(false);
            filterContracts(filter);
            presentAlert({
              header: "Success",
              message: "Your vote has been accepted",
            });
          }, BLOCK_TIME);
        } else {
          setLoading(false);
          console.error("Cannot find the type for contract ", contract);

          throw new Error(
            "Cannot find the type for contract " + contract.address
          );
        }
      } catch (error: any) {
        setLoading(false);
        console.table(`Error: ${JSON.stringify(error, null, 2)}`);
        let tibe: TransactionInvalidBeaconError =
          new TransactionInvalidBeaconError(error);
        presentAlert({
          header: "Error",
          message: tibe.data_message,
        });
      }
    } else {
      console.log("Please select an option.");
      setLoading(false);
    }
  };

  const buttonChoices = (contract: VotingContract) => {
    if (contract)
      return (
        <>
          {userCanVoteNow(
            contract,
            userAddress as address,
            bakerPower,
            bakerDeactivated
          ) ? (
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
                      <IonButton
                        onClick={async () => {
                          await votePopup.current?.dismiss();
                        }}
                      >
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
                <IonContent className="ion-padding ionContentBg">
                  <IonCard>
                    <IonCardHeader>
                      <IonTitle>Question</IonTitle>
                    </IonCardHeader>

                    <IonCardContent>
                      <IonLabel>{contract.name}</IonLabel>
                    </IonCardContent>
                  </IonCard>

                  <IonCard>
                    <IonCardHeader>
                      <IonTitle>Options</IonTitle>

                      {bakerPower > 0 ? (
                        <IonCardSubtitle>
                          Baker voting power : {bakerPower / 1000000}
                        </IonCardSubtitle>
                      ) : (
                        ""
                      )}
                    </IonCardHeader>
                    <IonCardContent>
                      <IonRadioGroup
                        value={voteValue}
                        onIonChange={(e) => setVoteValue(e.target.value)}
                      >
                        {contract.options.map((option: string) => (
                          <IonRadio
                            style={{ margin: "1em" }}
                            key={option}
                            value={option}
                          >
                            {option}
                          </IonRadio>
                        ))}
                      </IonRadioGroup>
                    </IonCardContent>
                  </IonCard>
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

  /*  MAIN FRAME **/
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
              <IonTitle style={{ margin: "0.5em" }}>Search</IonTitle>
              <IonSearchbar
                color="dark"
                animated
                debounce={1000}
                id="searchInput"
                placeholder="Filter here ..."
                value={filter.inputValue}
                onIonChange={(e) => {
                  let inputValue = e.target.value;
                  if (
                    inputValue === undefined ||
                    !inputValue ||
                    inputValue === ""
                  ) {
                    inputValue = "*";
                  }
                  const newFilter = { ...filter, inputValue: inputValue };
                  setFilter(newFilter); //search all
                  console.log("onIonChange searchbar", inputValue);
                  filterContracts(newFilter); //filter
                }}
              />
              <IonRow style={{ margin: "0.5em" }}>
                <IonToggle
                  enableOnOffLabels
                  checked={filter.votableOnly}
                  onClick={(e) => {
                    const newFilter = {
                      ...filter,
                      votableOnly: e.currentTarget.checked,
                    };
                    setFilter(newFilter);
                    filterContracts(newFilter);
                  }}
                >
                  Votable
                </IonToggle>
                &nbsp;&nbsp;&nbsp;
                <IonToggle
                  enableOnOffLabels
                  checked={filter.openOnly}
                  onClick={(e) => {
                    const newFilter = {
                      ...filter,
                      openOnly: e.currentTarget.checked,
                    };
                    setFilter(newFilter);
                    filterContracts(newFilter);
                  }}
                >
                  Open
                </IonToggle>
                &nbsp;&nbsp;&nbsp;
                <IonToggle
                  enableOnOffLabels
                  checked={filter.mineOnly}
                  onClick={(e) => {
                    const newFilter = {
                      ...filter,
                      mineOnly: e.currentTarget.checked,
                    };
                    setFilter(newFilter);
                    filterContracts(newFilter);
                  }}
                >
                  Mine
                </IonToggle>
                &nbsp;&nbsp;&nbsp;
                <IonToggle
                  enableOnOffLabels
                  checked={filter.newerThan2Weeks}
                  onClick={(e) => {
                    const newFilter = {
                      ...filter,
                      newerThan2Weeks: e.currentTarget.checked,
                    };
                    setFilter(newFilter);
                    filterContracts(newFilter);
                  }}
                >
                  Newer than 2 weeks
                </IonToggle>
                <IonSelect
                  placeholder="Filter by template"
                  onIonChange={(ev) => {
                    const newFilter = { ...filter, template: ev.detail.value };
                    setFilter(newFilter);
                    filterContracts(newFilter);
                  }}
                  multiple={true}
                  value={filter.template}
                >
                  <IonSelectOption
                    key={VOTING_TEMPLATE.PERMISSIONEDSIMPLEPOLL.name}
                    value={VOTING_TEMPLATE.PERMISSIONEDSIMPLEPOLL.name}
                  >
                    {VOTING_TEMPLATE.PERMISSIONEDSIMPLEPOLL.name}
                  </IonSelectOption>
                  <IonSelectOption
                    key={VOTING_TEMPLATE.TEZOSTEMPLATE.name}
                    value={VOTING_TEMPLATE.TEZOSTEMPLATE.name}
                  >
                    {VOTING_TEMPLATE.TEZOSTEMPLATE.name}
                  </IonSelectOption>
                </IonSelect>
              </IonRow>{" "}
            </IonToolbar>
          </IonHeader>
          <IonContent fullscreen className="ionContentBg">
            <IonRefresher slot="fixed" onIonRefresh={refreshData}>
              <IonRefresherContent></IonRefresherContent>
            </IonRefresher>

            {contracts.length === 0 ? (
              <IonTitle> No results ...</IonTitle>
            ) : (
              <IonGrid>
                <IonRow>
                  {contracts.map((contract, _) => (
                    <IonCol
                      key={contract.address}
                      sizeSm="12"
                      sizeXs="12"
                      sizeMd="6"
                      sizeXl="4"
                    >
                      <IonCard key={contract.address}>
                        <IonCardHeader>
                          <IonCardTitle>
                            <IonRow>
                              <IonText>{contract.name}</IonText>
                              &nbsp;
                              <IonAvatar
                                style={{ height: "20px", width: "20px" }}
                              >
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
                              &nbsp;
                              <IonIcon
                                color={
                                  contract.status === STATUS.ONGOING
                                    ? "success"
                                    : "danger"
                                }
                                icon={
                                  contract.status === STATUS.ONGOING
                                    ? lockOpenOutline
                                    : lockClosedOutline
                                }
                              ></IonIcon>
                              &nbsp;
                              <a
                                href={`https://${
                                  NetworkType[
                                    import.meta.env.VITE_NETWORK.toUpperCase() as keyof typeof NetworkType
                                  ]
                                }.tzkt.io/${contract.address}/info`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <IonIcon icon={eyeOutline} />
                              </a>
                              &nbsp;
                              <IonIcon
                                style={{ cursor: "pointer" }}
                                icon={shareSocialOutline}
                                onClick={async () => {
                                  const url =
                                    window.location.host +
                                    PAGES.SETTINGS +
                                    "/" +
                                    contract.type.name +
                                    "/" +
                                    contract.address;
                                  if (Capacitor.isNativePlatform()) {
                                    await Share.share({
                                      title: "Share this poll",
                                      url: url.replace(
                                        "localhost",
                                        "https://tzvote.marigold.dev"
                                      ), //override for native app
                                      dialogTitle: "Share with your buddies",
                                    });
                                  } else {
                                    navigator.clipboard.writeText(url);
                                    presentAlert({
                                      header: "Copied to clipboard !",
                                      message: url,
                                    });
                                  }
                                }}
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
                                    NetworkType[
                                      import.meta.env[
                                        "VITE_NETWORK"
                                      ].toUpperCase() as keyof typeof NetworkType
                                    ] +
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
                              <IonLabel>&nbsp; Details</IonLabel>
                            </IonButton>
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
                              new Date(contract.to).getTime() -
                                new Date().getTime()
                            )}
                          </>
                        ) : (
                          ""
                        )}
                      </IonCard>
                    </IonCol>
                  ))}
                </IonRow>
              </IonGrid>
            )}

            {userAddress ? (
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
            ) : (
              ""
            )}
          </IonContent>
          <IonFooter>
            <IonToolbar>
              {userAddress ? <DisconnectButton /> : <ConnectButton />}
            </IonToolbar>
          </IonFooter>
        </>
      )}
    </IonPage>
  );
};
