import {
  IonAvatar,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonChip,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonImg,
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
  radioButtonOnOutline,
  returnUpBackOutline,
  trophyOutline,
} from "ionicons/icons";
import React, { useEffect, useState } from "react";
import { RouteComponentProps, useHistory } from "react-router-dom";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { UserContext, UserContextType } from "../App";
import {
  VOTING_TEMPLATE,
  VotingContract,
  convertFromTZKTTezosContractToPermissionnedSimplePollTemplateVotingContract,
  convertFromTZKTTezosContractToTezosTemplateVotingContract,
  getWinner,
} from "../contractutils/TezosUtils";
import { Storage as TezosTemplateVotingContract } from "../tezosTemplate3.types";

import { int } from "../type-aliases";

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
      value: number;
    }[]
  >([]);

  const initColorArray = (dataItems: Array<any>): void => {
    var result = new Map<string, string>();
    for (let dataitem of dataItems) {
      var letters = "0123456789ABCDEF".split("");
      var color = "#";
      for (var j = 0; j < 6; j += 1) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      result.set(dataitem.name, color);
    }
    setColorArray(result);
  };

  const [colorArray, setColorArray] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    (async () => {
      let selectedContract: VotingContract;
      let contractFromTzkt: api.Contract = await api.contractsGetByAddress(id);
      let contractStorageFromTzkt: Blob = await api.contractsGetStorage(id);

      contractFromTzkt.storage = JSON.parse(
        await contractStorageFromTzkt.text()
      );

      switch (type) {
        case VOTING_TEMPLATE.PERMISSIONEDSIMPLEPOLL.name: {
          selectedContract =
            await convertFromTZKTTezosContractToPermissionnedSimplePollTemplateVotingContract(
              Tezos,
              contractFromTzkt
            );

          break;
        }
        case VOTING_TEMPLATE.TEZOSTEMPLATE.name: {
          selectedContract =
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

      setSelectedContract(selectedContract);

      const data = Array.from(selectedContract.results.keys()).map((key) => {
        return {
          name: key,
          value: selectedContract.results.get(key).toNumber(),
        };
      });
      setData(data);

      initColorArray(data);
    })();
  }, []);

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
      <IonContent fullscreen className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonTitle>Question</IonTitle>
          </IonCardHeader>

          <IonCardContent>
            <IonLabel>{selectedContract?.name}</IonLabel>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonTitle>Dates</IonTitle>
            {selectedContract?.type === VOTING_TEMPLATE.TEZOSTEMPLATE ? (
              <IonCardSubtitle>
                Period index :{" "}
                {(
                  selectedContract as TezosTemplateVotingContract
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
              <IonCol>
                {new Date(selectedContract?.from!).toLocaleString()}
              </IonCol>

              <IonCol>
                {new Date(selectedContract?.to!).toLocaleString()}
              </IonCol>
            </IonRow>
          </IonCardContent>
        </IonCard>

        {data.length > 0 ? (
          <IonGrid>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
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
                      fill={colorArray.get(entry.name)}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </IonGrid>
        ) : (
          <IonImg src="/noresults.png" />
        )}
        <IonGrid style={{ border: "1px white solid" }}>
          <IonRow style={{ borderBottom: "1px white solid" }}>
            <IonCol>Options</IonCol>
            <IonCol>Result</IonCol>
          </IonRow>

          {selectedContract
            ? Object.entries<string>(selectedContract?.options).map(
                ([key, value]) => (
                  <IonRow key={key}>
                    <IonCol style={{ textAlign: "left" }}>
                      <IonIcon
                        icon={radioButtonOnOutline}
                        style={{ fill: colorArray.get(value) }}
                      ></IonIcon>
                      {value}
                    </IonCol>
                    <IonCol>
                      {getWinner(selectedContract).indexOf(value) >= 0 ? (
                        <IonIcon icon={trophyOutline} />
                      ) : (
                        ""
                      )}
                      {selectedContract.results.get(value)
                        ? selectedContract.results.get(value).toNumber() /
                          (selectedContract.type ===
                          VOTING_TEMPLATE.TEZOSTEMPLATE
                            ? 1000000
                            : 1)
                        : 0}
                    </IonCol>
                  </IonRow>
                )
              )
            : ""}
        </IonGrid>

        <IonGrid>
          <IonChip>
            <IonAvatar style={{ fontSize: "initial", marginTop: 0 }}>
              {selectedContract?.votes.size}
            </IonAvatar>
            <IonLabel>Voters</IonLabel>
          </IonChip>

          {selectedContract && type === VOTING_TEMPLATE.TEZOSTEMPLATE.name ? (
            <IonChip>
              <IonAvatar
                style={{
                  fontSize: "initial",
                  marginTop: 0,

                  width: "auto",
                }}
              >
                {Array.from(selectedContract.results.values())
                  .reduce(
                    (value: int, acc: int) => value.plus(acc) as int,
                    new BigNumber(0) as int
                  )
                  .toNumber() / 1000000}
              </IonAvatar>
              <IonLabel>Total baker power</IonLabel>
            </IonChip>
          ) : (
            ""
          )}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};
