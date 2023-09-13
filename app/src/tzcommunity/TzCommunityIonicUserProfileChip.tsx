import { IonAvatar, IonChip, IonImg, IonLabel } from "@ionic/react";
import { CSSProperties } from "react";
import { address } from "../type-aliases";
import { UserProfile } from "./TzCommunityUtils";

type TzCommunityIonicUserProfileChipProps = {
  userProfiles: Map<address, UserProfile>;
  address: address;
  color?: string;
  style?: CSSProperties;
};

export const TzCommunityIonicUserProfileChip = ({
  userProfiles,
  address,
  color,
  style,
}: TzCommunityIonicUserProfileChipProps) => {
  return (
    <>
      {userProfiles.get(address) ? (
        <IonChip color={color} style={style}>
          <IonAvatar>
            <img
              alt="o"
              style={{ objectFit: "contain", padding: "0.2em" }}
              src={userProfiles.get(address)?.photo}
            />
          </IonAvatar>
          <IonLabel>
            {userProfiles.get(address)?.displayName +
              " (" +
              userProfiles.get(address)?.socialAccountAlias +
              ") "}
          </IonLabel>
          <IonAvatar>
            <IonImg
              alt="social network"
              style={{ objectFit: "contain", padding: "0.2em" }}
              src={"/" + userProfiles.get(address)?.socialAccountType + ".png"}
            />
          </IonAvatar>
        </IonChip>
      ) : (
        <IonChip color={color} style={style} className="address">
          {address}
        </IonChip>
      )}
    </>
  );
};
