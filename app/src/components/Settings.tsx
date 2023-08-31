import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonRow,
  IonSpinner,
  IonTitle,
  IonToolbar,
  useIonAlert,
} from "@ionic/react";
import * as api from "@tzkt/sdk-api";
import {
  addCircleOutline,
  radioButtonOffOutline,
  returnUpBackOutline,
  trashBinOutline,
} from "ionicons/icons";
import React, { useEffect, useState } from "react";
import { RouteComponentProps, useHistory } from "react-router-dom";
import { UserContext, UserContextType } from "../App";
import {
  VOTING_TEMPLATE,
  VotingContract,
  VotingContractUtils,
} from "../contractutils/TezosContractUtils";
import {
  Storage as PermissionedSimplePollVotingContract,
  PermissionedSimplePollWalletType,
} from "../permissionedSimplePoll.types";

import { WalletContract } from "@taquito/taquito";
import { TransactionInvalidBeaconError } from "../contractutils/TezosUtils";
import { address } from "../type-aliases";

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
  const { Tezos, bakerDelegators } = React.useContext(
    UserContext
  ) as UserContextType;

  const refreshData = async (): Promise<void> => {
    let contract: VotingContract;
    let contractFromTzkt: api.Contract = await api.contractsGetByAddress(id);
    switch (type) {
      case VOTING_TEMPLATE.PERMISSIONEDSIMPLEPOLL.name: {
        contract =
          await VotingContractUtils.convertFromTZKTTezosContractToPermissionnedSimplePollTemplateVotingContract(
            Tezos,
            contractFromTzkt
          );

        break;
      }
      case VOTING_TEMPLATE.TEZOSTEMPLATE.name: {
        contract =
          await VotingContractUtils.convertFromTZKTTezosContractToTezosTemplateVotingContract(
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
      await refreshData();
    })();
  }, []);

  //add,remove member button
  const [inputVoter, setInputVoter] = React.useState<string>("");

  const handleAddVoter = async () => {
    setLoading(true);

    if (inputVoter !== "") {
      try {
        let c: WalletContract = await Tezos.wallet.at("" + contract!.address);

        if (contract!.type == VOTING_TEMPLATE.PERMISSIONEDSIMPLEPOLL) {
          const c = await Tezos.wallet.at<PermissionedSimplePollWalletType>(
            contract!.address
          );

          const op = await c.methods.addVoter(inputVoter as address).send();

          await op.confirmation();
          //refresh info on list
          setTimeout(async () => {
            await refreshData();
            setLoading(false);
          }, 7000);
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
          console.log("the list will refresh soon");
          await refreshData();
          setLoading(false);
        }, 7000);
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
              <IonTitle>Settings</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent fullscreen>
            {contract &&
            contract.type == VOTING_TEMPLATE.PERMISSIONEDSIMPLEPOLL ? (
              <>
                <IonCard>
                  <IonCardHeader>
                    <IonTitle>Voters</IonTitle>
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
                            onClick={() => {
                              setContract({
                                ...contract,
                                registeredVoters: [...bakerDelegators].map(
                                  (s) => s as address
                                ),
                              });
                            }}
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
