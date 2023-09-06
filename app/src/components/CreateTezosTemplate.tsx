import {
  IonAvatar,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonRadio,
  IonRadioGroup,
  IonRow,
  IonSpinner,
  IonTextarea,
  IonTitle,
  IonToolbar,
  useIonAlert,
} from "@ionic/react";
import { BigNumber } from "bignumber.js";

import {
  addCircleOutline,
  radioButtonOffOutline,
  returnUpBackOutline,
  trashBinOutline,
} from "ionicons/icons";
import React, { useState } from "react";
import { useHistory } from "react-router";
import { PAGES, UserContext, UserContextType } from "../App";
import {
  TransactionInvalidBeaconError,
  getCurrentAndNextAtBestVotingPeriodDates,
  getVotingPeriodIndex,
} from "../contractutils/TezosUtils";
import { Storage as TezosTemplateVotingContract } from "../tezosTemplate3.types";
import { address, asMap, int, nat } from "../type-aliases";

import jsonContractTemplate from "../contracttemplates/tezosTemplate3.json";
import { VOTING_TEMPLATE } from "../contractutils/TezosUtils";

const CreateTezosTemplate: React.FC = () => {
  const { Tezos, userAddress } = React.useContext(
    UserContext
  ) as UserContextType;

  //TEZOS OPERATIONS
  const [loading, setLoading] = React.useState(false);

  // MESSAGES

  const [presentAlert] = useIonAlert();
  const { push, goBack } = useHistory();
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
        await getVotingPeriodIndex(Tezos)
      ) as nat;
      console.log("votingPeriodIndex", contract.votingPeriodIndex);

      setCurrentVotingPeriodIndex(contract.votingPeriodIndex);
      setPeriodDates(await getCurrentAndNextAtBestVotingPeriodDates(Tezos, 5));
      setContract(contract);
    })();
  }, []);

  const createVoteContract = async () => {
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
              <IonButtons slot="end">
                <IonButton
                  disabled={
                    !contract.name ||
                    !contract.votingPeriodIndex ||
                    contract.options.length == 0
                  }
                  onClick={createVoteContract}
                >
                  <IonLabel>Create</IonLabel>
                </IonButton>
              </IonButtons>

              <IonTitle>
                <IonRow>
                  Create &nbsp;
                  <IonAvatar style={{ height: "20px", width: "20px" }}>
                    <IonImg src="/baker.png" />
                  </IonAvatar>
                  &nbsp; Poll
                </IonRow>
              </IonTitle>
            </IonToolbar>
          </IonHeader>

          <IonContent fullscreen>
            <IonCard>
              <IonCardHeader>
                <IonTitle>Description</IonTitle>
                <IonCardSubtitle>
                  {VOTING_TEMPLATE.TEZOSTEMPLATE.description}
                </IonCardSubtitle>
              </IonCardHeader>

              <IonCardContent></IonCardContent>
            </IonCard>

            <IonCard>
              <IonCardHeader>
                <IonTitle>Question</IonTitle>
              </IonCardHeader>

              <IonCardContent>
                <IonTextarea
                  autoGrow
                  labelPlacement="floating"
                  color="primary"
                  required
                  id="name"
                  placeholder="Type question here ..."
                  maxlength={100}
                  counter
                  onIonInput={(e) => {
                    setContract({
                      ...contract,
                      name: e.target.value!,
                    } as TezosTemplateVotingContract);
                  }}
                />
              </IonCardContent>
            </IonCard>

            <IonCard>
              <IonCardHeader>
                <IonTitle>Voting Period</IonTitle>
              </IonCardHeader>

              <IonCardContent>
                <IonRadioGroup
                  aria-labelledby="demo-radio-buttons-group-label"
                  defaultValue="25"
                  name="radio-buttons-group"
                  value={contract.votingPeriodIndex.toNumber()}
                  onIonChange={(e) => {
                    setContract({
                      ...contract,
                      votingPeriodIndex: new BigNumber(e.target.value!),
                    } as TezosTemplateVotingContract);
                  }}
                >
                  {[...Array(5)].map((_: undefined, index: number) => (
                    <IonRadio
                      style={{ margin: "1em" }}
                      key={currentVotingPeriodIndex.plus(index).toNumber()}
                      value={currentVotingPeriodIndex.plus(index).toNumber()}
                    >
                      <div>
                        Period {currentVotingPeriodIndex.plus(index).toNumber()}
                        <br />
                        (From{" "}
                        {periodDates[index]
                          ? periodDates[index].toLocaleString()
                          : ""}
                        <br />
                        To{" "}
                        {periodDates[index + 1]
                          ? periodDates[index + 1].toLocaleString() + ")"
                          : ""}
                        <br />
                      </div>
                    </IonRadio>
                  ))}
                </IonRadioGroup>
              </IonCardContent>
            </IonCard>

            <IonCard>
              <IonCardHeader>
                <IonTitle>Options</IonTitle>
                <IonCardSubtitle>
                  <IonRow>
                    <IonInput
                      style={{ width: "80%" }}
                      value={inputOption}
                      label="New option to add"
                      labelPlacement="floating"
                      color="primary"
                      required
                      id="name"
                      placeholder="Enter new option here ..."
                      maxlength={100}
                      counter
                      onIonInput={(e) => {
                        setInputOption(e.target.value as string);
                      }}
                    ></IonInput>

                    <IonButton
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
                  </IonRow>
                </IonCardSubtitle>
              </IonCardHeader>

              <IonCardContent>
                {" "}
                <IonList lines="inset" inputMode="text">
                  {contract.options.map((option: string, index: number) => (
                    <IonItem key={index}>
                      <IonLabel>
                        <IonIcon icon={radioButtonOffOutline} /> &nbsp; {option}
                      </IonLabel>

                      <IonIcon
                        color="danger"
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
              </IonCardContent>
            </IonCard>
          </IonContent>
        </>
      )}
    </IonPage>
  );
};

export default CreateTezosTemplate;
