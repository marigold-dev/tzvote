import {
  IonAvatar,
  IonButton,
  IonButtons,
  IonChip,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonLabel,
  IonPage,
  IonRow,
  IonTitle,
  IonToolbar,
  useIonAlert,
} from "@ionic/react";
import * as api from "@tzkt/sdk-api";
import { BigNumber } from "bignumber.js";
import {
  ellipseOutline,
  returnUpBackOutline,
  trophyOutline,
} from "ionicons/icons";
import React, { FormEvent, useEffect, useState } from "react";
import { RouteComponentProps, useHistory } from "react-router-dom";
import { Cell, Pie, PieChart } from "recharts";
import { UserContext, UserContextType } from "../App";
import {
  VOTING_TEMPLATE,
  VotingContract,
  VotingContractUtils,
  getWinner,
} from "../contractutils/TezosContractUtils";
import { PermissionedSimplePollWalletType } from "../permissionedSimplePoll.types";

import { WalletContract } from "@taquito/taquito";
import { TransactionInvalidBeaconError } from "../contractutils/TezosUtils";
import { address, int } from "../type-aliases";

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.3;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      fontSize={"0.8em"}
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

type ResultsProps = RouteComponentProps<{
  type: string;
  id: string;
}>;

export const Results: React.FC<ResultsProps> = ({ match }) => {
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
  const [selectedContract, setSelectedContract] = useState<VotingContract>();

  //CONTEXT
  const { Tezos, userAddress } = React.useContext(
    UserContext
  ) as UserContextType;

  const [data, setData] = useState<
    {
      name: string;
      value: int;
    }[]
  >([]);

  const getColorArray = (dataItems: Array<any>): Map<string, string> => {
    var result = new Map<string, string>();
    for (let dataitem of dataItems) {
      var letters = "0123456789ABCDEF".split("");
      var color = "#";
      for (var j = 0; j < 6; j += 1) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      result.set(dataitem.name, color);
    }
    return result;
  };

  useEffect(() => {
    (async () => {
      let selectedContract: VotingContract;
      let contractFromTzkt: api.Contract = await api.contractsGetByAddress(id);
      switch (type) {
        case VOTING_TEMPLATE.PERMISSIONEDSIMPLEPOLL.name: {
          selectedContract =
            await VotingContractUtils.convertFromTZKTTezosContractToPermissionnedSimplePollTemplateVotingContract(
              Tezos,
              contractFromTzkt
            );

          break;
        }
        case VOTING_TEMPLATE.TEZOSTEMPLATE.name: {
          selectedContract =
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

      setSelectedContract(selectedContract);

      setData(
        Array.from(selectedContract.results.keys()).map((key) => {
          return { name: key, value: selectedContract.results.get(key) };
        })
      );
    })();
  }, []);

  //add,remove member button
  const [voterAddress, setVoterAddress] = React.useState<string>("");

  const handleAddVoter = async (
    event: FormEvent<HTMLFormElement>,
    contract: VotingContract
  ) => {
    event.preventDefault();
    setLoading(true);

    if (voterAddress !== "") {
      try {
        let c: WalletContract = await Tezos.wallet.at("" + contract.address);

        if (contract.type == VOTING_TEMPLATE.PERMISSIONEDSIMPLEPOLL) {
          const c = await Tezos.wallet.at<PermissionedSimplePollWalletType>(
            contract.address
          );

          const op = await c.methods.addVoter(voterAddress as address).send();

          await op.confirmation();
          //refresh info on list
          setTimeout(() => {
            console.log("the list will refresh soon");
            //TODO refreshData();
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
      } finally {
        setLoading(false);
      }
    } else {
      console.log("Please, enter an address.");
    }

    setLoading(false);
  };

  const handleRemoveVoter = async (
    event: FormEvent<HTMLFormElement>,
    contract: VotingContract
  ) => {
    event.preventDefault();
    setLoading(true);

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
          await op.confirmation();
          //refresh info on list
          setTimeout(() => {
            console.log("the list will refresh soon");
            //TODO refreshData();
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
      } finally {
        setLoading(false);
      }
    } else {
      console.log("Please, enter an address.");
    }
    setLoading(false);
  };

  return (
    <IonPage className="container">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={goBack}>
              <IonIcon icon={returnUpBackOutline}></IonIcon>
              <IonLabel>Back</IonLabel>
            </IonButton>
          </IonButtons>
          <IonTitle>Results</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonGrid>
          <IonRow>
            <IonCol>Options</IonCol>
            <IonCol>Result</IonCol>
          </IonRow>

          {selectedContract
            ? Object.entries<string>(selectedContract?.options).map(
                ([key, value]) => (
                  <IonRow key={key}>
                    <IonCol>
                      <IonIcon
                        icon={ellipseOutline}
                        color={getColorArray(data).get(value)}
                      ></IonIcon>
                      {value}
                    </IonCol>
                    <IonCol>
                      {getWinner(selectedContract).indexOf(value) >= 0 ? (
                        <IonIcon icon={trophyOutline} />
                      ) : (
                        ""
                      )}
                      {selectedContract.results.get(value)?.toNumber()}
                    </IonCol>
                  </IonRow>
                )
              )
            : ""}
        </IonGrid>
        <IonGrid>
          <PieChart
            width={window.innerWidth * 0.3}
            height={window.innerHeight * 0.3}
          >
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius="100%"
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getColorArray(data).get(entry.name)}
                />
              ))}
            </Pie>
          </PieChart>
        </IonGrid>

        <IonGrid>
          <div style={{ padding: "0.2em" }}>
            <IonChip>
              <IonAvatar>{selectedContract?.votes.size}</IonAvatar>
              <IonLabel>Voters</IonLabel>
            </IonChip>
          </div>

          {selectedContract && type === VOTING_TEMPLATE.TEZOSTEMPLATE.name ? (
            <div style={{ padding: "0.2em" }}>
              <IonChip>
                <IonAvatar>
                  {Array.from(selectedContract.results.values())
                    .reduce(
                      (value: int, acc: int) => value.plus(acc) as int,
                      new BigNumber(0) as int
                    )
                    .toNumber()}
                </IonAvatar>
                <IonLabel>Baker power</IonLabel>
              </IonChip>
            </div>
          ) : (
            ""
          )}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};
