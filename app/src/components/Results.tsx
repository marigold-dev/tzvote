import {
  IonAvatar,
  IonChip,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonLabel,
  IonPage,
  IonRow,
  useIonAlert,
} from "@ionic/react";
import * as api from "@tzkt/sdk-api";
import { BigNumber } from "bignumber.js";
import { ellipseOutline, trophyOutline } from "ionicons/icons";
import React, { useEffect, useState } from "react";
import { RouteComponentProps, useHistory } from "react-router-dom";
import { Cell, Pie, PieChart } from "recharts";
import { UserContext, UserContextType } from "../App";
import {
  VOTING_TEMPLATE,
  getWinner,
} from "../contractutils/TezosContractUtils";
import {
  Storage as PermissionedSimplePollVotingContract,
  PermissionedSimplePollWalletType,
} from "../permissionedSimplePoll.types";

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

  const id: string = match.params.id;
  const type: string = match.params.type;

  const [selectedContract, setSelectedContract] = useState<
    PermissionedSimplePollVotingContract | PermissionedSimplePollVotingContract
  >();

  const { Tezos } = React.useContext(UserContext) as UserContextType;

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
      const permissionedSimplePollWalletType: PermissionedSimplePollWalletType =
        await Tezos.wallet.at<PermissionedSimplePollWalletType>(id);

      const selectedContract = await permissionedSimplePollWalletType.storage();
      setSelectedContract(selectedContract);

      setData(
        Array.from(selectedContract.results.keys()).map((key) => {
          return { name: key, value: selectedContract.results.get(key) };
        })
      );
    })();
  }, []);

  return (
    <IonPage>
      <IonContent style={{ minWidth: "90vw", minHeight: "50vh" }}>
        <IonGrid>
          <IonRow>
            <IonCol>Options</IonCol>
            <IonCol>Result</IonCol>
          </IonRow>

          {selectedContract
            ? Object.entries<string>(selectedContract?.options).map(
                ([key, value]) => (
                  <IonRow
                    key={key}
                    style={{
                      "&:last-child td, &:last-child th": {
                        border: 0,
                      },
                    }}
                  >
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
                      {selectedContract?.results.get(value).toNumber()}
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
