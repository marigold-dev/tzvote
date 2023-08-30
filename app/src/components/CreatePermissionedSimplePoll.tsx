import {
  IonButton,
  IonContent,
  IonDatetime,
  IonGrid,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonPopover,
  IonSpinner,
} from "@ionic/react";

import { MichelsonMap } from "@taquito/taquito";

import { useIonAlert } from "@ionic/react";
import {
  addCircleOutline,
  radioButtonOffOutline,
  trashBinOutline,
} from "ionicons/icons";
import React, { FormEvent, useState } from "react";
import { useHistory } from "react-router";
import { PAGES, UserContext, UserContextType } from "../App";
import { TransactionInvalidBeaconError } from "../contractutils/TezosUtils";
import { Storage as PermissionedSimplePollVotingContract } from "../permissionedSimplePoll.types";
import { address, asMap, int, timestamp } from "../type-aliases";

import jsonContractTemplate from "../contracttemplates/permissionedSimplePoll.json";

const CreatePermissionedSimplePoll: React.FC = () => {
  const { Tezos, userAddress, bakerDelegators } = React.useContext(
    UserContext
  ) as UserContextType;

  const { push } = useHistory();

  //TEZOS OPERATIONS
  const [loading, setLoading] = React.useState(false);

  // MESSAGES

  const [presentAlert] = useIonAlert();

  // CURRRENT CONTRACT

  const [contract, setContract] =
    useState<PermissionedSimplePollVotingContract>({
      name: "Enter question here ...",
      from_: new Date().toISOString() as timestamp,
      to: new Date().toISOString() as timestamp,
      options: [],
      registeredVoters: [],
      results: asMap<string, int>([]),
      votes: asMap<address, string>([]),
      owner: userAddress as address,
    });

  const [inputOption, setInputOption] = useState<string>("");
  const [inputVoter, setInputVoter] = useState<string>("");

  const createVoteContract = async (
    event: FormEvent<HTMLFormElement>,
    contract: PermissionedSimplePollVotingContract
  ) => {
    event.preventDefault();

    //block if no option
    if (contract.options == undefined || contract.options.length == 0) {
      console.log("At least one option is needed...");
      return;
    }

    //block if no option
    if (!contract.from_ || !contract.to) {
      console.log("All dates are required");
      return;
    }

    setLoading(true);

    Tezos.wallet
      .originate({
        code: jsonContractTemplate,
        storage: {
          name: contract.name,
          from_: contract.from_,
          to: contract.to,
          options: contract.options,
          owner: contract.owner,
          registeredVoters: contract.registeredVoters,
          results: MichelsonMap.fromLiteral(contract.results), //MichelsonMap<string, int>
          votes: MichelsonMap.fromLiteral(contract.votes), //MichelsonMap<address, string>
        },
      })
      .send()
      .then((originationOp) => {
        console.log(`Waiting for confirmation of origination...`);
        return originationOp.contract();
      })
      .then((contract) => {
        push(PAGES.SEARCH);
        presentAlert({
          header: "Success",
          message: `Origination completed for ${contract.address}.`,
        });
      })
      .catch((error) => {
        console.table(`Error: ${JSON.stringify(error, null, 2)}`);
        let tibe: TransactionInvalidBeaconError =
          new TransactionInvalidBeaconError(error);
        presentAlert({
          header: "Error",
          message: tibe.data_message,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <IonPage>
      {loading ? (
        <IonSpinner color="inherit" />
      ) : (
        <>
          <form onSubmit={(e) => createVoteContract(e, contract)}>
            <IonGrid>
              <IonContent>
                <IonInput
                  required
                  id="name"
                  label="Question"
                  onIonChange={(e) => {
                    setContract({
                      ...contract,
                      name: e.target.value!,
                    } as PermissionedSimplePollVotingContract);
                  }}
                />

                <IonLabel
                  style={{ paddingTop: "1em", paddingBottom: "1em" }}
                  id="demo-radio-buttons-group-label"
                >
                  Select dates*
                </IonLabel>

                <IonDatetime
                  value={contract.from_}
                  onIonChange={(e) => {
                    setContract({
                      ...contract,
                      dateFrom: e.target.value!,
                    } as PermissionedSimplePollVotingContract);
                  }}
                >
                  <span slot="time-label">Enter start date*</span>
                </IonDatetime>

                <IonDatetime
                  value={contract.to}
                  onIonChange={(e) => {
                    setContract({
                      ...contract,
                      dateTo: e.target.value!,
                    } as PermissionedSimplePollVotingContract);
                  }}
                >
                  <span slot="time-label">Enter end date*</span>
                </IonDatetime>
              </IonContent>
            </IonGrid>

            <IonGrid>
              <IonLabel
                color={contract.options.length == 0 ? "danger" : "info"}
                id="demo-radio-buttons-group-label"
              >
                Options*
              </IonLabel>

              <div>
                <IonInput
                  value={inputOption}
                  label="type your option here"
                  onIonChange={(e) => setInputOption(e.target.value as string)}
                ></IonInput>

                <IonButton
                  id="add"
                  style={{ marginLeft: "1em" }}
                  onClick={() => {
                    setContract({
                      ...contract,
                      options: contract.options.concat(inputOption),
                    } as PermissionedSimplePollVotingContract);
                    setInputOption("");
                  }}
                >
                  <IonIcon
                    icon={addCircleOutline}
                    style={{ padding: "0.4em 0em" }}
                  />
                </IonButton>
                <IonPopover
                  trigger="add"
                  triggerAction="hover"
                  isOpen={contract.options.length === 0}
                  aria-label="add"
                >
                  <IonContent class="ion-padding">
                    At least one option is needed
                  </IonContent>
                </IonPopover>
              </div>

              <IonList inputMode="text">
                {contract.options.map((option: string, index: number) => (
                  <IonItem key={index}>
                    <div>
                      <IonIcon icon={radioButtonOffOutline} />

                      <IonLabel>{option}</IonLabel>

                      <IonIcon
                        icon={trashBinOutline}
                        onClick={() => {
                          contract.options.splice(index, 1);
                          setContract({
                            ...contract,
                            options: contract.options,
                          } as PermissionedSimplePollVotingContract);
                        }}
                      />
                    </div>
                  </IonItem>
                ))}
              </IonList>

              <IonLabel>Registered voters</IonLabel>
              <div>
                {bakerDelegators.length > 0 ? (
                  <IonButton
                    style={{ marginRight: "1em", marginBottom: "0.2em" }}
                    onClick={() => {
                      setContract({
                        ...contract,
                        registeredVoters: bakerDelegators,
                      } as PermissionedSimplePollVotingContract);
                    }}
                  >
                    Add all delegators
                  </IonButton>
                ) : (
                  ""
                )}

                <IonInput
                  value={inputVoter}
                  label="Add voter here"
                  onIonChange={(e) => setInputVoter(e.target.value as string)}
                ></IonInput>
                <IonButton
                  style={{ marginLeft: "1em" }}
                  onClick={() => {
                    setContract({
                      ...contract,
                      registeredVoters: [
                        ...contract.registeredVoters,
                        inputVoter as address,
                      ],
                    } as PermissionedSimplePollVotingContract);
                    setInputVoter("");
                  }}
                >
                  <IonIcon icon={addCircleOutline} />
                </IonButton>
              </div>

              <IonList inputMode="text">
                {contract.registeredVoters.map(
                  (voter: string, index: number) => (
                    <IonItem key={voter}>
                      <IonIcon icon={radioButtonOffOutline} />

                      <IonLabel>{voter}</IonLabel>

                      <IonIcon
                        icon={trashBinOutline}
                        onClick={() => {
                          contract.registeredVoters.splice(index, 1);
                          setContract({
                            ...contract,
                            registeredVoters: contract.registeredVoters,
                          } as PermissionedSimplePollVotingContract);
                        }}
                      />
                    </IonItem>
                  )
                )}
              </IonList>
            </IonGrid>
            <IonGrid>
              <div>
                <IonButton
                  style={{ mt: 1, mr: 1 }}
                  type="submit"
                  disabled={
                    !contract.name ||
                    !contract.from_ ||
                    !contract.to ||
                    contract.options.length == 0
                  }
                >
                  CREATE
                </IonButton>
              </div>
            </IonGrid>
          </form>
        </>
      )}
    </IonPage>
  );
};

export default CreatePermissionedSimplePoll;
