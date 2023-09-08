import {
  IonAvatar,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCol,
  IonContent,
  IonHeader,
  IonIcon,
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonPage,
  IonRadio,
  IonRadioGroup,
  IonRow,
  IonSpinner,
  IonTitle,
  IonToolbar,
  useIonAlert,
} from "@ionic/react";
import * as api from "@tzkt/sdk-api";
import {
  TezosTemplate3WalletType,
  Storage as TezosTemplateVotingContract,
} from "../tezosTemplate3.types";

import {
  addCircleOutline,
  lockClosedOutline,
  lockOpenOutline,
  radioButtonOffOutline,
  returnUpBackOutline,
  trashBinOutline,
} from "ionicons/icons";
import React, { useEffect, useRef, useState } from "react";
import { RouteComponentProps, useHistory } from "react-router-dom";
import { UserContext, UserContextType } from "../App";
import {
  STATUS,
  VOTING_TEMPLATE,
  VotingContract,
  convertFromTZKTTezosContractToPermissionnedSimplePollTemplateVotingContract,
  convertFromTZKTTezosContractToTezosTemplateVotingContract,
  userCanVoteNow,
} from "../contractutils/TezosUtils";
import {
  Storage as PermissionedSimplePollVotingContract,
  PermissionedSimplePollWalletType,
} from "../permissionedSimplePoll.types";

import { WalletContract } from "@taquito/taquito";
import { TransactionInvalidBeaconError } from "../contractutils/TezosUtils";
import { address, key_hash } from "../type-aliases";

type SettingsProps = RouteComponentProps<{
  type: string;
  id: string;
}>;

export const Settings: React.FC<SettingsProps> = ({ match }) => {
  api.defaults.baseUrl =
    "https://api." + import.meta.env.VITE_NETWORK + ".tzkt.io";

  const [presentAlert] = useIonAlert();
  const { goBack } = useHistory();

  //TEZOS OPERATIONS
  const [loading, setLoading] = React.useState(false);

  //PARAMS
  const id: string = match.params.id;
  const type: string = match.params.type;

  //SELECTED CONTRACT
  const [contract, setContract] = useState<VotingContract>();

  //CONTEXT
  const {
    Tezos,
    bakerDelegators,
    userAddress,
    reloadUser,
    BLOCK_TIME,
    bakerPower,
    bakerDeactivated,
  } = React.useContext(UserContext) as UserContextType;

  const refreshData = async (): Promise<void> => {
    let contract: VotingContract;
    let contractFromTzkt: api.Contract = await api.contractsGetByAddress(id);
    let contractStorageFromTzkt: Blob = await api.contractsGetStorage(id);

    contractFromTzkt.storage = JSON.parse(await contractStorageFromTzkt.text());
    switch (type) {
      case VOTING_TEMPLATE.PERMISSIONEDSIMPLEPOLL.name: {
        contract =
          await convertFromTZKTTezosContractToPermissionnedSimplePollTemplateVotingContract(
            Tezos,
            contractFromTzkt
          );

        break;
      }
      case VOTING_TEMPLATE.TEZOSTEMPLATE.name: {
        contract =
          await convertFromTZKTTezosContractToTezosTemplateVotingContract(
            Tezos,
            contractFromTzkt
          );
        break;
      }
      default: {
        console.error("Cannot guess the contract template type", type, id);
        throw new Error(
          "Cannot guess the contract template type " + type + " for id " + id
        );
      }
    }

    setContract(contract);
  };

  useEffect(() => {
    (async () => {
      //in case of forced page refresh
      if (!userAddress) {
        (async () => {
          await reloadUser();
        })();
      }

      await refreshData();
    })();
  }, []);

  //add,remove member button
  const [inputVoter, setInputVoter] = React.useState<string>("");

  const handleAddDelegatorVoters = async () => {
    try {
      const batch = Tezos.wallet.batch();
      let batchNotEmpty: boolean = false;
      await Promise.all(
        bakerDelegators.map(async (delegator) => {
          //only new voters
          if (
            (
              contract as PermissionedSimplePollVotingContract
            ).registeredVoters.indexOf(delegator as address) < 0
          ) {
            const c = await Tezos.wallet.at<PermissionedSimplePollWalletType>(
              contract!.address
            );
            batchNotEmpty = true;
            const op = await c.methods.addVoter(delegator as address);

            batch.withContractCall(op);
          }
        })
      );

      if (batchNotEmpty) {
        const batchOp = await batch.send();

        await batchOp.confirmation();
        //refresh info on list
        setTimeout(async () => {
          await refreshData();
          setLoading(false);
        }, BLOCK_TIME);
      } else {
        presentAlert({
          header: "Wanning",
          message: "All delegators already added",
        });
      }
    } catch (error: any) {
      console.table(`Error: ${JSON.stringify(error, null, 2)}`);
      let tibe: TransactionInvalidBeaconError =
        new TransactionInvalidBeaconError(error);
      presentAlert({
        header: "Error",
        message: tibe.data_message,
      });
      setLoading(false);
    }
  };

  const handleAddVoter = async () => {
    console.log("handleAddVoter", inputVoter);

    setLoading(true);

    if (inputVoter !== "") {
      try {
        let c: WalletContract = await Tezos.wallet.at("" + contract!.address);

        if (contract!.type == VOTING_TEMPLATE.PERMISSIONEDSIMPLEPOLL) {
          const c = await Tezos.wallet.at<PermissionedSimplePollWalletType>(
            contract!.address
          );

          const op = await c.methods.addVoter(inputVoter as address).send();

          //refresh info on list

          console.log("op sent ...");

          setTimeout(async () => {
            await refreshData();
            setLoading(false);
            console.log("refresh done ...");
          }, BLOCK_TIME);
        } else if (contract!.type == VOTING_TEMPLATE.TEZOSTEMPLATE) {
          console.error("Cannot add voter to this template ", contract);

          throw new Error(
            "Cannot add voter to this template " + contract!.address
          );
        } else {
          console.error("Cannot find the type for contract ", contract);

          throw new Error(
            "Cannot find the type for contract " + contract!.address
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
        setLoading(false);
      }
    } else {
      console.log("Please, enter an address.");
      setLoading(false);
    }
  };

  const handleRemoveVoter = async (selectedVoter: address) => {
    setLoading(true);

    try {
      let c: WalletContract = await Tezos.wallet.at("" + contract!.address);

      if (contract!.type == VOTING_TEMPLATE.PERMISSIONEDSIMPLEPOLL) {
        const c = await Tezos.wallet.at<PermissionedSimplePollWalletType>(
          contract!.address
        );

        const op = await c.methods.removeVoter(selectedVoter).send();
        await op.confirmation();
        //refresh info on list
        setTimeout(async () => {
          await refreshData();
          setLoading(false);
        }, BLOCK_TIME);
      } else if (contract!.type == VOTING_TEMPLATE.TEZOSTEMPLATE) {
        console.error("Cannot remove voter to this template ", contract);

        throw new Error(
          "Cannot remove voter to this template " + contract!.address
        );
      } else {
        console.error("Cannot find the type for contract ", contract);

        throw new Error(
          "Cannot find the type for contract " + contract!.address
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
      setLoading(false);
    }
  };

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

          console.log("BLOCK_TIME", BLOCK_TIME);

          //refresh info on list
          setTimeout(() => {
            refreshData();
            setLoading(false);
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
          setTimeout(() => {
            refreshData();
          }, BLOCK_TIME);

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
              <IonButtons slot="start">
                <IonButton onClick={goBack}>
                  <IonIcon icon={returnUpBackOutline}></IonIcon>
                  <IonLabel>Back</IonLabel>
                </IonButton>
              </IonButtons>

              <IonTitle>
                <IonRow className="container">
                  Poll &nbsp;
                  <IonAvatar style={{ height: "20px", width: "20px" }}>
                    <IonImg
                      src={
                        contract?.type ===
                        VOTING_TEMPLATE.PERMISSIONEDSIMPLEPOLL
                          ? "/permissioned.png"
                          : "/baker.png"
                      }
                    />
                  </IonAvatar>
                  &nbsp; details
                </IonRow>
              </IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent fullscreen className="ionContentBg">
            <IonCard>
              <IonCardHeader>
                <IonTitle>Question</IonTitle>
                <IonCardSubtitle>From {contract?.creator}</IonCardSubtitle>
              </IonCardHeader>

              <IonCardContent>
                <IonLabel>{contract?.name}</IonLabel>
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
                <IonRadioGroup>
                  {contract?.options.map((option: string) => (
                    <IonRadio
                      style={{ margin: "1em" }}
                      key={option}
                      value={option}
                      contentEditable={false}
                    >
                      {option}
                    </IonRadio>
                  ))}
                </IonRadioGroup>
              </IonCardContent>
            </IonCard>

            <IonCard>
              <IonCardHeader>
                <IonTitle>Dates</IonTitle>
                <IonCardSubtitle>
                  Status :{" "}
                  <IonIcon
                    color={
                      contract?.status === STATUS.ONGOING ? "success" : "danger"
                    }
                    icon={
                      contract?.status === STATUS.ONGOING
                        ? lockOpenOutline
                        : lockClosedOutline
                    }
                  ></IonIcon>
                </IonCardSubtitle>
                {contract?.type === VOTING_TEMPLATE.TEZOSTEMPLATE ? (
                  <IonCardSubtitle>
                    Period index :{" "}
                    {(
                      contract as TezosTemplateVotingContract
                    ).votingPeriodIndex.toNumber() - 1}
                  </IonCardSubtitle>
                ) : (
                  ""
                )}
              </IonCardHeader>
              <IonCardContent>
                <IonRow>
                  {" "}
                  <IonCol>From</IonCol>
                  <IonCol>To</IonCol>
                </IonRow>
                <IonRow>
                  <IonCol>{new Date(contract?.from!).toLocaleString()}</IonCol>

                  <IonCol>{new Date(contract?.to!).toLocaleString()}</IonCol>
                </IonRow>
              </IonCardContent>
            </IonCard>

            {userCanVoteNow(
              contract!,
              userAddress as address,
              bakerPower,
              bakerDeactivated
            ) ? (
              <>
                <IonButton
                  id={"votePopupIdSettings" + contract?.address}
                  color="dark"
                >
                  <IonIcon icon="/voting.svg"></IonIcon>
                  <IonLabel>VOTE</IonLabel>
                </IonButton>

                <IonModal
                  className="container"
                  trigger={"votePopupIdSettings" + contract?.address}
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
                        <IonButton onClick={() => handleVoteSubmit(contract!)}>
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
                        <IonLabel>{contract?.name}</IonLabel>
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
                          {contract?.options.map((option: string) => (
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

            {contract &&
            contract.type == VOTING_TEMPLATE.PERMISSIONEDSIMPLEPOLL &&
            userAddress === contract.creator ? (
              <>
                <IonCard>
                  <IonCardHeader>
                    <IonTitle>Manage voters</IonTitle>
                    <IonCardSubtitle>
                      <IonRow>
                        <IonInput
                          style={{ width: "80%" }}
                          value={inputVoter}
                          label="New voter to add"
                          labelPlacement="floating"
                          color="primary"
                          required
                          id="name"
                          placeholder="Enter new voter here ..."
                          maxlength={100}
                          counter
                          onIonInput={(e) => {
                            setInputVoter(e.target.value as string);
                          }}
                        ></IonInput>

                        <IonButton
                          style={{ marginLeft: "1em" }}
                          onClick={() => handleAddVoter()}
                        >
                          <IonIcon icon={addCircleOutline} />
                        </IonButton>
                        {bakerDelegators.length > 0 ? (
                          <IonButton
                            style={{
                              marginRight: "1em",
                              marginBottom: "0.2em",
                            }}
                            onClick={handleAddDelegatorVoters}
                          >
                            <IonIcon icon={addCircleOutline} /> &nbsp;
                            delegators
                          </IonButton>
                        ) : (
                          ""
                        )}
                      </IonRow>
                    </IonCardSubtitle>
                  </IonCardHeader>

                  <IonCardContent>
                    <IonList inputMode="text">
                      {(
                        contract as PermissionedSimplePollVotingContract
                      ).registeredVoters.map((voter: string, index: number) => (
                        <IonItem key={voter}>
                          <IonLabel>
                            <IonIcon icon={radioButtonOffOutline} /> &nbsp;{" "}
                            {voter}
                          </IonLabel>

                          <IonIcon
                            color="danger"
                            icon={trashBinOutline}
                            onClick={() => handleRemoveVoter(voter as address)}
                          />
                        </IonItem>
                      ))}
                    </IonList>
                  </IonCardContent>
                </IonCard>
              </>
            ) : (
              ""
            )}
          </IonContent>
        </>
      )}
    </IonPage>
  );
};
