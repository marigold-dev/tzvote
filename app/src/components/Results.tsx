import { Share } from "@capacitor/share";

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
  shareSocialOutline,
  trophyOutline,
} from "ionicons/icons";
import React, { useEffect, useState } from "react";
import { RouteComponentProps, useHistory } from "react-router-dom";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { PAGES, UserContext, UserContextType } from "../App";
import {
  VOTING_TEMPLATE,
  VotingContract,
  convertFromTZKTTezosContractToPermissionnedSimplePollTemplateVotingContract,
  convertFromTZKTTezosContractToTezosTemplateVotingContract,
  getWinner,
} from "../contractutils/TezosUtils";
import { Storage as TezosTemplateVotingContract } from "../tezosTemplate3.types";

import { Capacitor } from "@capacitor/core";
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
  const { push } = useHistory(); //mandatory in case of a shared page, there is no history

  //TEZOS OPERATIONS
  const [loading, setLoading] = React.useState(false);

  //PARAMS
  const id: string = match.params.id;
  const type: string = match.params.type;

  //SELECTED CONTRACT
  const [contract, setContract] = useState<VotingContract>();

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

      setContract(selectedContract);

      const data = Array.from(selectedContract.results.keys()).map((key) => {
        return {
          name: key,
          value: selectedContract.results.get(key).toNumber(),
        };
      });
      setData(data);

      initColorArray(data);
    })();
  }, [id]);

  return (
    <IonPage className="container">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => push(PAGES.SEARCH)}>
              <IonIcon icon={returnUpBackOutline}></IonIcon>
              <IonLabel>Back</IonLabel>
            </IonButton>
          </IonButtons>
          <IonButtons slot="end">
            <IonButton
              onClick={async () => {
                const url =
                  window.location.host +
                  PAGES.SETTINGS +
                  "/" +
                  contract?.type.name +
                  "/" +
                  contract?.address;
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
            >
              <IonIcon
                slot="end"
                style={{ cursor: "pointer" }}
                icon={shareSocialOutline}
              ></IonIcon>
              <IonLabel>Share</IonLabel>
            </IonButton>
          </IonButtons>
          <IonTitle>Results</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding ionContentBg">
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
            <IonTitle>Dates</IonTitle>
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
          <IonImg style={{ height: "30vh" }} src="/noresults.png" />
        )}
        <IonGrid style={{ border: "1px white solid" }}>
          <IonRow style={{ borderBottom: "1px white solid" }}>
            <IonCol>Options</IonCol>
            <IonCol>Result (nb votes)</IonCol>
          </IonRow>

          {contract
            ? Object.entries<string>(contract?.options).map(([key, value]) => (
                <IonRow key={key}>
                  <IonCol style={{ textAlign: "left" }}>
                    <IonIcon
                      icon={radioButtonOnOutline}
                      style={{ fill: colorArray.get(value) }}
                    ></IonIcon>
                    {value}
                  </IonCol>
                  <IonCol>
                    {getWinner(contract).indexOf(value) >= 0 ? (
                      <IonIcon icon={trophyOutline} />
                    ) : (
                      ""
                    )}
                    {contract.results.get(value)
                      ? contract.results.get(value).toNumber() /
                        (contract.type === VOTING_TEMPLATE.TEZOSTEMPLATE
                          ? 1000000
                          : 1)
                      : 0}
                  </IonCol>
                </IonRow>
              ))
            : ""}
        </IonGrid>

        <IonGrid>
          <IonChip>
            <IonAvatar style={{ fontSize: "initial", marginTop: 0 }}>
              {contract?.votes.size}
            </IonAvatar>
            <IonLabel>Voters</IonLabel>
          </IonChip>

          {contract && type === VOTING_TEMPLATE.TEZOSTEMPLATE.name ? (
            <IonChip>
              <IonAvatar
                style={{
                  fontSize: "initial",
                  marginTop: 0,

                  width: "auto",
                }}
              >
                {Array.from(contract.results.values())
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
