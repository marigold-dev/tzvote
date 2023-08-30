import { NetworkType } from "@airgap/beacon-sdk";
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonChip,
  IonCol,
  IonContent,
  IonFooter,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput,
  IonLabel,
  IonModal,
  IonPage,
  IonPopover,
  IonProgressBar,
  IonRadio,
  IonRadioGroup,
  IonRow,
  IonSearchbar,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  useIonAlert,
} from "@ionic/react";

import { WalletContract } from "@taquito/taquito";
import { Contract } from "@tzkt/sdk-api";
//import * as moment from "moment";
import moment from "moment";
import momentDurationFormatSetup from "moment-duration-format";
import React, { FormEvent, useRef, useState } from "react";
import {
  VOTING_TEMPLATE,
  VotingContract,
  VotingContractUtils,
  getWinner,
  userCanVoteNow,
} from "../contractutils/TezosContractUtils";
import {
  STATUS,
  TransactionInvalidBeaconError,
} from "../contractutils/TezosUtils";

import {
  Storage as PermissionedSimplePollVotingContract,
  PermissionedSimplePollWalletType,
} from "../permissionedSimplePoll.types";

import {
  TezosTemplate3WalletType,
  Storage as TezosTemplateVotingContract,
} from "../tezosTemplate3.types";

import * as api from "@tzkt/sdk-api";
import {
  albumsOutline,
  barChartOutline,
  helpOutline,
  personCircleOutline,
  podiumOutline,
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
    wallet,
    setUserAddress,
  } = React.useContext(UserContext) as UserContextType;

  const [presentAlert] = useIonAlert();
  const { push } = useHistory();

  //SEARCH
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = useState<Array<string>>([]);
  const loading = open && options.length === 0;
  const [inputValue, setInputValue] = React.useState<string>("");

  //LIST
  const [allContracts, setAllContracts] = useState<Array<VotingContract>>([]);
  const [contracts, setContracts] = useState<Array<VotingContract>>([]);

  //SELECTED CONTRACT
  const [selectedContract, setSelectedContract] =
    useState<VotingContract | null>(null);

  //TEZOS OPERATIONS
  const [tezosLoading, setTezosLoading] = React.useState(false);

  const refreshData = () => {
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
        const activeAccount = await wallet.client.getActiveAccount();
        setUserAddress(activeAccount!.address);
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

  const handleVoteSubmit = async (
    event: FormEvent<HTMLFormElement>,
    contract: VotingContract
  ) => {
    event.preventDefault();
    setTezosLoading(true);

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
        setTezosLoading(false);
      }
    } else {
      console.log("Please select an option.");
    }

    setTezosLoading(false);
  };

  //membership popup
  const [AddVoterPopup, setAddVoterPopup] = React.useState<null | HTMLElement>(
    null
  );
  const [RemoveVoterPopup, setRemoveVoterPopup] =
    React.useState<null | HTMLElement>(null);
  const showAddVoter = (
    event: React.MouseEvent<HTMLButtonElement>,
    c: VotingContract | null
  ) => {
    setAddVoterPopup(event.currentTarget);
    setSelectedContract(c);
  };
  const showRemoveVoter = (
    event: React.MouseEvent<HTMLButtonElement>,
    c: VotingContract | null
  ) => {
    setRemoveVoterPopup(event.currentTarget);
    setSelectedContract(c);
  };
  const closeAddVoter = () => {
    setAddVoterPopup(null);
    setSelectedContract(null);
  };
  const closeRemoveVoter = () => {
    setRemoveVoterPopup(null);
    setSelectedContract(null);
  };
  //add,remove member button
  const [voterAddress, setVoterAddress] = React.useState<string>("");

  const handleAddVoter = async (
    event: FormEvent<HTMLFormElement>,
    contract: VotingContract
  ) => {
    event.preventDefault();
    setTezosLoading(true);

    if (voterAddress !== "") {
      try {
        let c: WalletContract = await Tezos.wallet.at("" + contract.address);

        if (contract.type == VOTING_TEMPLATE.PERMISSIONEDSIMPLEPOLL) {
          const c = await Tezos.wallet.at<PermissionedSimplePollWalletType>(
            contract.address
          );

          const op = await c.methods.addVoter(voterAddress as address).send();
          closeAddVoter();
          await op.confirmation();
          //refresh info on list
          setTimeout(() => {
            console.log("the list will refresh soon");
            refreshData();
            filterOnNewInput(inputValue);
          }, 2000);
          presentAlert({
            header: "Success",
            message: "You have added a new voter (wait a bit the refresh)",
          });
        } else if (contract.type == VOTING_TEMPLATE.TEZOSTEMPLATE) {
          console.error("Cannot add voter to this template ", contract);

          throw new Error(
            "Cannot add voter to this template " + contract.address
          );
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
        closeAddVoter();
      } finally {
        setTezosLoading(false);
      }
    } else {
      console.log("Please, enter an address.");
    }

    setTezosLoading(false);
  };

  const handleRemoveVoter = async (
    event: FormEvent<HTMLFormElement>,
    contract: VotingContract
  ) => {
    event.preventDefault();
    setTezosLoading(true);

    if (voterAddress !== "") {
      try {
        let c: WalletContract = await Tezos.wallet.at("" + contract.address);

        if (contract.type == VOTING_TEMPLATE.PERMISSIONEDSIMPLEPOLL) {
          const c = await Tezos.wallet.at<PermissionedSimplePollWalletType>(
            contract.address
          );

          const op = await c.methods
            .removeVoter(voterAddress as address)
            .send();
          closeRemoveVoter();
          await op.confirmation();
          //refresh info on list
          setTimeout(() => {
            console.log("the list will refresh soon");
            refreshData();
            filterOnNewInput(inputValue);
          }, 2000);
          presentAlert({
            header: "Success",
            message: "You have removed a voter (wait a bit the refresh)",
          });
        } else if (contract.type == VOTING_TEMPLATE.TEZOSTEMPLATE) {
          console.error("Cannot remove voter to this template ", contract);

          throw new Error(
            "Cannot remove voter to this template " + contract.address
          );
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
        closeAddVoter();
      } finally {
        setTezosLoading(false);
      }
    } else {
      console.log("Please, enter an address.");
    }
    setTezosLoading(false);
  };

  const buttonChoices = (contract: VotingContract) => {
    let canVote = userCanVoteNow(contract, userAddress as address, bakerPower);
    return (
      <IonContent>
        {selectedContract && canVote ? (
          <IonButton
            style={{ margin: "0.2em" }}
            id={"votePopupId" + selectedContract.address}
          >
            VOTE
          </IonButton>
        ) : (
          ""
        )}

        {selectedContract ? (
          <IonModal
            trigger={"votePopupId" + selectedContract.address}
            ref={votePopup}
          >
            <IonContent style={{ minWidth: "20em", minHeight: "10em" }}>
              <div style={{ padding: "1em" }}>
                <form onSubmit={(e) => handleVoteSubmit(e, selectedContract)}>
                  <IonLabel id="demo-radio-buttons-group-label">
                    Options
                  </IonLabel>
                  <IonRadioGroup
                    aria-labelledby="demo-radio-buttons-group-label"
                    name="radio-buttons-group"
                    value={voteValue}
                    onIonChange={(e) => setVoteValue(e.detail.value)}
                  >
                    {selectedContract.options.map((option: string) => (
                      <IonRadio key={option} value={option}>
                        {option}
                      </IonRadio>
                    ))}
                  </IonRadioGroup>

                  <IonButton style={{ mt: 1, mr: 1 }} type="submit">
                    VOTE
                  </IonButton>
                </form>
              </div>
            </IonContent>
          </IonModal>
        ) : (
          <div />
        )}

        {selectedContract &&
        contract.type == VOTING_TEMPLATE.PERMISSIONEDSIMPLEPOLL &&
        (contract as PermissionedSimplePollVotingContract).owner ===
          userAddress ? (
          <div>
            <IonButton
              style={{ margin: "0.2em" }}
              id={"addVoterPopupId" + selectedContract.address}
            >
              Add voter
            </IonButton>
            <IonButton
              style={{ margin: "0.2em" }}
              id={"removeVoterPopupId" + selectedContract.address}
            >
              Remove voter
            </IonButton>
          </div>
        ) : (
          ""
        )}

        {selectedContract ? (
          <div>
            <IonModal trigger={"addVoterPopupId" + selectedContract.address}>
              <IonContent style={{ minWidth: "20em", minHeight: "10em" }}>
                <div style={{ padding: "1em" }}>
                  <form onSubmit={(e) => handleAddVoter(e, selectedContract!)}>
                    <IonLabel id="demo-radio-buttons-group-label">
                      Enter an address
                    </IonLabel>
                    <IonInput
                      type="text"
                      placeholder="tz..."
                      required
                      value={voterAddress}
                      onChange={(e) =>
                        setVoterAddress(e.currentTarget.value! as string)
                      }
                    />
                    <IonButton style={{ mt: 1, mr: 1 }} type="submit">
                      Add voter
                    </IonButton>
                  </form>
                </div>
              </IonContent>
            </IonModal>

            <IonModal trigger={"removeVoterPopupId" + selectedContract.address}>
              <IonContent style={{ minWidth: "20em", minHeight: "10em" }}>
                <div style={{ padding: "1em" }}>
                  <form
                    onSubmit={(e) => handleRemoveVoter(e, selectedContract)}
                  >
                    <IonLabel id="demo-radio-buttons-group-label">
                      Enter an address
                    </IonLabel>
                    <IonInput
                      type="text"
                      placeholder="tz..."
                      required
                      value={voterAddress}
                      onChange={(e) =>
                        setVoterAddress(e.currentTarget.value! as string)
                      }
                    />

                    <IonButton style={{ mt: 1, mr: 1 }} type="submit">
                      Remove voter
                    </IonButton>
                  </form>
                </div>
              </IonContent>
            </IonModal>
          </div>
        ) : (
          ""
        )}

        {contract.type == VOTING_TEMPLATE.PERMISSIONEDSIMPLEPOLL ? (
          <>
            <IonIcon
              id="PERMISSIONEDSIMPLEPOLL-icon"
              icon={albumsOutline}
              color="info"
            />

            <IonPopover
              trigger="PERMISSIONEDSIMPLEPOLL-icon"
              triggerAction="hover"
            >
              <IonGrid>
                <IonRow>
                  <IonCol style={{ margin: 0, padding: 0, color: "white" }}>
                    Registered users
                  </IonCol>
                </IonRow>
                {(
                  contract as PermissionedSimplePollVotingContract
                ).registeredVoters.map((c) => (
                  <IonRow key={c}>
                    <IonCol style={{ margin: 0, padding: 0, color: "white" }}>
                      {c}
                    </IonCol>
                  </IonRow>
                ))}
              </IonGrid>
            </IonPopover>
          </>
        ) : (
          ""
        )}
      </IonContent>
    );
  };

  /*************************************/
  /***  RESULT AREA *******************
   *************************************/

  //popupresults
  const [resultPopup, setResultPopup] = React.useState<null | HTMLElement>(
    null
  );
  const showResults = (
    event: React.MouseEvent<HTMLDivElement>,
    c: VotingContract
  ) => {
    setSelectedContract(c);
    setResultPopup(event.currentTarget);
  };
  const closeResults = () => {
    setSelectedContract(null);
    setResultPopup(null);
  };

  const resultArea = (contract: VotingContract) => {
    // STATUS.ONGOING
    let status = contract.status;
    if (status == STATUS.ONGOING) {
      return (
        <div>
          <IonChip
            aria-owns={open ? "resultPopupId" + contract.address : undefined}
            aria-haspopup="true"
            onClick={() =>
              push(PAGES.RESULTS + "/" + contract.type + "/" + contract.address)
            }
            color="success"
          >
            <IonLabel>{status}</IonLabel>
            <IonIcon icon={syncCircleOutline}></IonIcon>
          </IonChip>

          {new Date(contract.from).getTime()}
          <IonProgressBar
            style={{ width: "90%" }}
            aria-label="Period"
            key={`slider-${contract.address}`}
            value={
              (new Date().getTime() - new Date(contract.from).getTime()) /
              (new Date(contract.to).getTime() -
                new Date(contract.from).getTime())
            }
          />

          <div>
            {durationToString(new Date(contract.to).getTime() - Date.now())}
          </div>
        </div>
      );
    } else {
      // STATUS.LOCKED
      const winnerList = getWinner(contract);
      if (winnerList.length > 0) {
        const result: string = "Winner is : " + winnerList.join(" , ");
        return (
          <div>
            <IonChip
              aria-owns={open ? "resultPopupId" + contract.address : undefined}
              aria-haspopup="true"
              onClick={() =>
                push(
                  PAGES.RESULTS + "/" + contract.type + "/" + contract.address
                )
              }
              onMouseLeave={closeResults}
              style={{ margin: "0.2em" }}
              color="error"
            >
              <IonLabel>
                {" "}
                <span>
                  {status}
                  <br />

                  {contract.type == VOTING_TEMPLATE.TEZOSTEMPLATE
                    ? "Period : " +
                      (contract as TezosTemplateVotingContract)
                        .votingPeriodIndex
                    : "From " +
                      new Date(contract.from).toLocaleString() +
                      " to " +
                      contract.to.toLocaleString()}
                </span>
              </IonLabel>
              <IonIcon icon={podiumOutline}></IonIcon>
            </IonChip>
          </div>
        );
      } else {
        return (
          <div>
            <IonChip
              aria-owns={open ? "resultPopupId" + contract.address : undefined}
              aria-haspopup="true"
              onClick={() =>
                push(
                  PAGES.RESULTS + "/" + contract.type + "/" + contract.address
                )
              }
              style={{ margin: "0.2em" }}
              color="warning"
            >
              <IonLabel>
                <span>
                  {status}
                  <br />

                  {contract.type == VOTING_TEMPLATE.TEZOSTEMPLATE
                    ? "Period : " +
                      (contract as TezosTemplateVotingContract)
                        .votingPeriodIndex
                    : "From " +
                      new Date(contract.from).toLocaleString() +
                      " to " +
                      contract.to.toLocaleString()}
                </span>
              </IonLabel>
              <IonIcon icon={barChartOutline}></IonIcon>
            </IonChip>
            <IonChip style={{ margin: "0.2em" }}>
              <IonLabel>NO WINNER</IonLabel>
              <IonIcon icon={helpOutline}></IonIcon>
            </IonChip>
          </div>
        );
      }
    }
  };

  /*************************************/
  /***  MAIN FRAME *******************
   *************************************/
  return (
    <IonPage className="container">
      {loading ? (
        <IonSpinner color="inherit" />
      ) : (
        <>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Search</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent fullscreen>
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
                  <IonCardContent>
                    <IonGrid style={{ flex: "1 0 auto", padding: "1vw" }}>
                      <IonRow>
                        <IonText>
                          <h6>
                            <a
                              href={`https://${
                                import.meta.env.VITE_NETWORK
                                  ? NetworkType[
                                      import.meta.env.VITE_NETWORK.toUpperCase() as keyof typeof NetworkType
                                    ]
                                  : NetworkType.GHOSTNET
                              }.tzkt.io/${contract.address}/info`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {contract.name}
                            </a>

                            <IonChip color="dark" id={contract.address}>
                              {contract.type.name ==
                              VOTING_TEMPLATE.PERMISSIONEDSIMPLEPOLL.name
                                ? "P"
                                : "B"}
                            </IonChip>
                            <IonPopover
                              trigger={contract.address}
                              triggerAction="hover"
                            >
                              <IonContent class="ion-padding">
                                {contract.type.description}
                              </IonContent>
                            </IonPopover>
                          </h6>
                        </IonText>
                      </IonRow>
                      <IonRow>
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
                      </IonRow>
                    </IonGrid>
                  </IonCardContent>

                  <IonButton>//TODO Replace buttons !!!</IonButton>
                  {buttonChoices(contract)}

                  <IonButton>//TODO Replace results !!!</IonButton>
                  {resultArea(contract)}
                </IonCard>
              ))
            )}
          </IonContent>
          <IonFooter>
            <IonToolbar>
              <DisconnectButton /> {userAddress}
            </IonToolbar>
          </IonFooter>
        </>
      )}
    </IonPage>
  );
};
