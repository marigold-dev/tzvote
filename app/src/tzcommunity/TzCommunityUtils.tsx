import { SignPayloadResponse, SigningType } from "@airgap/beacon-types";
import { createMessagePayload, signIn } from "@siwt/sdk";
import { BeaconWallet } from "@taquito/beacon-wallet";
import { TezosToolkit } from "@taquito/taquito";
import * as api from "@tzkt/sdk-api";
import { BigMapKey } from "@tzkt/sdk-api";
import { BigNumber } from "bignumber.js";
import jwt_decode from "jwt-decode";
import { address } from "../type-aliases";
import { CachingService } from "./caching.service";
import { MainWalletType, Organization, Storage } from "./tzcommunity.types";

api.defaults.baseUrl =
  "https://api." + import.meta.env.VITE_NETWORK + ".tzkt.io";

export enum TzCommunityErrorType {
  ACCESS_TOKEN_NULL = "ACCESS_TOKEN_NULL",
  ACCESS_TOKEN_EXPIRED = "ACCESS_TOKEN_EXPIRED",
}

export class TzCommunityError extends Error {
  type: TzCommunityErrorType;
  constructor(message: string, type: TzCommunityErrorType) {
    super(message);
    this.type = type;
  }
}

export enum LocalStorageKeys {
  access_token = "access_token",
  refresh_token = "refresh_token",
  id_token = "id_token",
  bigMapsGetKeys = "bigMapsGetKeys",
}

export enum SOCIAL_ACCOUNT_TYPE {
  google = "google",
  twitter = "twitter",
  // facebook = "facebook",
  github = "github",
  gitlab = "gitlab",
  // microsoft = "microsoft",
  slack = "slack",
  //reddit = "reddit",
  //telegram = "telegram",
}

export type UserProfile = {
  displayName: string;
  socialAccountType: SOCIAL_ACCOUNT_TYPE;
  socialAccountAlias: string;
  photo: string;
};

export const connectToWeb2Backend = async (
  wallet: BeaconWallet,
  userAddress: string,
  publicKey: string,
  localStorage: CachingService
) => {
  // create the message to be signed
  const messagePayload = createMessagePayload({
    dappUrl: "tezos-community.com",
    pkh: userAddress,
  });

  // request the signature
  let signedPayload: SignPayloadResponse | undefined =
    await wallet.client.requestSignPayload({
      ...messagePayload,
      signingType: SigningType.MICHELINE,
    });

  // sign in the user to our app
  const res = (await signIn(
    import.meta.env.VITE_TZCOMMUNITY_BACKEND_URL! + "/siwt"
  )({
    pk: publicKey,
    pkh: userAddress,
    message: messagePayload.payload,
    signature: signedPayload!.signature,
  })) as Promise<{
    data: {
      accessToken: string;
      idToken: string;
      refreshToken: string;
      tokenType: string;
    };
  }>;

  const { accessToken, idToken, refreshToken } = (await res).data;

  console.log("SIWT Connected to web2 backend", jwt_decode(idToken));

  await localStorage.set(LocalStorageKeys.access_token, accessToken);
  await localStorage.set(LocalStorageKeys.refresh_token, refreshToken);
  await localStorage.set(LocalStorageKeys.id_token, idToken);

  console.log(
    "tokens stored",
    await localStorage.get(LocalStorageKeys.id_token)
  );
};

export const loadUserProfiles = async (
  Tezos: TezosToolkit,
  userAddress: string,
  localStorage: CachingService
): Promise<Map<address, UserProfile>> => {
  const accessToken = await localStorage.get(LocalStorageKeys.access_token);

  if (!accessToken) {
    console.error("you lost the SIWT accessToken, please reconnect...");
    throw new TzCommunityError(
      "you lost the SIWT accessToken, please reconnect...",
      TzCommunityErrorType.ACCESS_TOKEN_NULL
    );
  }

  let userProfiles = new Map();

  const mainWalletType: MainWalletType = await Tezos.wallet.at<MainWalletType>(
    import.meta.env.VITE_TZCOMMUNITY_CONTRACT_ADDRESS
  );
  const storage: Storage = await mainWalletType.storage();

  await Promise.all(
    storage!.organizations.map(async (orgItem: Organization) => {
      const membersBigMapId = (
        orgItem.members as unknown as { id: BigNumber }
      ).id.toNumber();
      const url = LocalStorageKeys.bigMapsGetKeys + membersBigMapId;
      let keys: BigMapKey[] = await localStorage.getWithTTL(url);

      if (!keys) {
        //console.warn("cache is empty for key : ", url);
        try {
          keys = await api.bigMapsGetKeys(membersBigMapId, {
            micheline: "Json",
            active: true,
          });
          await localStorage.setWithTTL(url, keys);
        } catch (error) {
          console.error("TZKT call failed", error);
        }
      }

      if (keys) {
        //check if member is part of it OR super admin
        if (
          keys.findIndex((key) => key.key === userAddress) >= 0 ||
          storage.tezosOrganization.admins.indexOf(userAddress as address) >= 0
        ) {
          console.log(
            "cache userprofiles as member is part of it OR super admin",
            keys
          );
          for (const key of keys) {
            const up = await getUserProfile(key.key, localStorage);
            if (up) {
              userProfiles.set(key.key, up);
            }
          }
        }
      }
    })
  );

  return userProfiles;
};

export const getUserProfile = async (
  whateverUserAddress: string,
  localStorage: CachingService
): Promise<UserProfile | null> => {
  console.log("getUserProfile", whateverUserAddress);

  try {
    const accessToken = await localStorage.get(LocalStorageKeys.access_token);

    if (!accessToken) {
      console.warn("you lost the SIWT accessToken, please reconnect...");
      throw new TzCommunityError(
        "you lost the SIWT accessToken, please reconnect...",
        TzCommunityErrorType.ACCESS_TOKEN_NULL
      );
    }
    const url =
      import.meta.env.VITE_TZCOMMUNITY_BACKEND_URL +
      "/user/" +
      whateverUserAddress;
    const up = await localStorage.getWithTTL(url);

    //console.log("getUserProfile - localStorage.getWithTTL", up, url);

    if (up && Object.keys(up).length > 0) {
      //not empty
      return new Promise((resolve, _) => resolve(up));
    } else if (up && Object.keys(up).length === 0) {
      //empty
      return new Promise((resolve, _) => resolve(null));
    } else {
      console.log("getUserProfile - fetch", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          authorization: "Bearer " + accessToken,
        },
      });

      const json = await response.json();

      console.log("getUserProfile - fetch", url, json);

      if (response.ok) {
        await localStorage.setWithTTL(url, json);
        return new Promise((resolve, _) => resolve(json));
      } else if (response.status === 401 || response.status === 403) {
        console.error("SIWT accessToken expired, try to refresh the token...");
        throw new TzCommunityError(
          "SIWT accessToken expired, try to refresh the token...",

          TzCommunityErrorType.ACCESS_TOKEN_EXPIRED
        );
      } else {
        //console.warn("User Profile not found", response);
        await localStorage.setWithTTL(url, {});
        return new Promise((resolve, _) => resolve(null));
      }
    }
  } catch (error) {
    console.error("error", error);
    if (error instanceof TzCommunityError) {
      return new Promise((_, reject) => reject(error));
    } else {
      return new Promise((resolve, _) => resolve(null));
    }
  }
};

export const refreshToken = async (
  userAddress: string,
  localStorage: CachingService
) => {
  try {
    console.log("**************refreshToken", userAddress, localStorage);

    const response = await fetch(
      import.meta.env.VITE_TZCOMMUNITY_BACKEND_URL + "/siwt/refreshToken",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken: await localStorage.get("refresh_token"),
          pkh: userAddress,
        }),
      }
    );
    const data = await response.json();
    if (response.ok) {
      const { accessToken, idToken, refreshToken } = data;
      console.log("SIWT reconnected to web2 backend", jwt_decode(idToken));

      await localStorage.set(LocalStorageKeys.access_token, accessToken);
      await localStorage.set(LocalStorageKeys.refresh_token, refreshToken);
      await localStorage.set(LocalStorageKeys.id_token, idToken);

      console.log(
        "tokens stored",
        await localStorage.get(LocalStorageKeys.id_token)
      );
    } else {
      console.error("error trying to refresh token", response);
      return new Promise((resolve, _) => resolve(null));
    }
  } catch (error) {
    console.error("error refreshToken", error); //cannot do more because session is dead
    throw new TzCommunityError(
      "you lost the SIWT accessToken, please reconnect...",
      TzCommunityErrorType.ACCESS_TOKEN_EXPIRED
    );
  }
};
