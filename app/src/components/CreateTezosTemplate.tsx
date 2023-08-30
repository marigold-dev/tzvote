import {
  IonButton,
  IonContent,
  IonGrid,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonPopover,
  IonRadio,
  IonRadioGroup,
  IonSpinner,
  useIonAlert,
} from "@ionic/react";
import { BigNumber } from "bignumber.js";

import {
  addCircleOutline,
  radioButtonOffOutline,
  trashBinOutline,
} from "ionicons/icons";
import React, { FormEvent, useState } from "react";
import { useHistory } from "react-router";
import { PAGES, UserContext, UserContextType } from "../App";
import {
  TezosUtils,
  TransactionInvalidBeaconError,
} from "../contractutils/TezosUtils";
import { Storage as TezosTemplateVotingContract } from "../tezosTemplate3.types";
import { address, asMap, int, nat } from "../type-aliases";

import jsonContractTemplate from "../contracttemplates/tezosTemplate3.json";

const CreateTezosTemplate: React.FC = () => {
  const { Tezos, userAddress } = React.useContext(
    UserContext
  ) as UserContextType;

  //TEZOS OPERATIONS
  const [loading, setLoading] = React.useState(false);

  // MESSAGES

  const [presentAlert] = useIonAlert();
  const { push } = useHistory();
  // CURRRENT CONTRACT

  const [contract, setContract] = useState<TezosTemplateVotingContract>({
    name: "",
    votingPeriodIndex: new BigNumber(0) as nat,
    options: [],
    results: asMap<string, int>([]),
    votes: asMap<address, string>([]),
    votingPeriodOracle: import.meta.env.VITE_ORACLE_ADDRESS! as address,
  });

  const [currentVotingPeriodIndex, setCurrentVotingPeriodIndex] = useState<nat>(
    new BigNumber(0) as nat
  );
  const [periodDates, setPeriodDates] = useState<Array<Date>>([]);
  const [inputOption, setInputOption] = useState<string>("");

  // INIT ONCE
  React.useEffect(() => {
    (async () => {
      contract.votingPeriodIndex = new BigNumber(
        await TezosUtils.getVotingPeriodIndex(Tezos)
      ) as nat;
      console.log("votingPeriodIndex", contract.votingPeriodIndex);

      setCurrentVotingPeriodIndex(contract.votingPeriodIndex);
      setPeriodDates(
        await TezosUtils.getCurrentAndNextAtBestVotingPeriodDates(Tezos, 5)
      );
      setContract(contract);
    })();
  }, []);

  const createVoteContract = async (
    event: FormEvent<HTMLFormElement>,
    contract: TezosTemplateVotingContract
  ) => {
    event.preventDefault();

    //block if no option
    if (contract.options == undefined || contract.options.length == 0) {
      console.log("At least one option is needed...");
      return;
    }

    setLoading(true);
    console.log(contract);

    Tezos.wallet
      .originate({
        code: jsonContractTemplate,
        storage: {
          name: contract.name,
          votingPeriodIndex: contract.votingPeriodIndex,
          options: contract.options,
          votes: contract.votes, //MichelsonMap<address, string>
          results: contract.results, //MichelsonMap<string, int>
          votingPeriodOracle: contract.votingPeriodOracle,
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
              <div>
                <IonInput
                  required
                  id="name"
                  label="Question"
                  value={contract.name}
                  onIonChange={(e) => {
                    setContract({
                      ...contract,
                      name: e.target.value!,
                    } as TezosTemplateVotingContract);
                  }}
                />

                <div style={{ paddingTop: "2em" }}>
                  <IonLabel id="demo-radio-buttons-group-label">
                    Select a period*
                  </IonLabel>
                  <IonRadioGroup
                    aria-labelledby="demo-radio-buttons-group-label"
                    defaultValue="25"
                    name="radio-buttons-group"
                    value={contract.votingPeriodIndex}
                    onIonChange={(e) => {
                      setContract({
                        ...contract,
                        votingPeriodIndex: new BigNumber(e.target.value!),
                      } as TezosTemplateVotingContract);
                    }}
                  >
                    {[...Array(5)].map((_: undefined, index: number) => (
                      <IonRadio
                        key={currentVotingPeriodIndex.plus(index).toNumber()}
                        value={currentVotingPeriodIndex.plus(index)}
                      >
                        <div>
                          Period{" "}
                          {currentVotingPeriodIndex.plus(index).toNumber()}
                          <br />
                          From{" "}
                          {periodDates[index]
                            ? periodDates[index].toLocaleDateString()
                            : ""}
                          <br />
                          To{" "}
                          {periodDates[index + 1]
                            ? periodDates[index + 1].toLocaleDateString()
                            : ""}
                          <br />
                          (estimated){" "}
                        </div>
                      </IonRadio>
                    ))}
                  </IonRadioGroup>
                </div>
              </div>
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
                    } as TezosTemplateVotingContract);
                    setInputOption("");
                  }}
                >
                  <IonIcon icon={addCircleOutline} />
                </IonButton>

                <IonPopover
                  trigger="add"
                  triggerAction="hover"
                  isOpen={contract.options.length == 0}
                  aria-label="add"
                >
                  <IonContent class="ion-padding">
                    At least one option is needed
                  </IonContent>
                </IonPopover>
              </div>

              <IonList inputMode="text">
                {contract.options.map((option: string, index: number) => (
                  <IonItem key={option}>
                    <IonIcon icon={radioButtonOffOutline} />

                    <IonLabel>{option}</IonLabel>

                    <IonIcon
                      icon={trashBinOutline}
                      onClick={() => {
                        contract.options.splice(index, 1);
                        setContract({
                          ...contract,
                          options: contract.options,
                        } as TezosTemplateVotingContract);
                      }}
                    />
                  </IonItem>
                ))}
              </IonList>
            </IonGrid>
            <IonGrid>
              <div>
                <IonButton
                  style={{ mt: 1, mr: 1 }}
                  type="submit"
                  disabled={
                    !contract.name ||
                    !contract.votingPeriodIndex ||
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

export default CreateTezosTemplate;
