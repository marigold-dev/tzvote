import { BeaconWallet } from "@taquito/beacon-wallet";
import React, { Dispatch, SetStateAction } from "react";
import { address } from "../type-aliases";
import { UserProfile } from "./TzCommunityUtils";
import { CachingService } from "./caching.service";

export type TzCommunityReactContextType = {
  userProfiles: Map<address, UserProfile>; //cache to avoid to run more queries on userProfiles
  setUserProfiles: Dispatch<SetStateAction<Map<address, UserProfile>>>;
  userProfile: UserProfile | undefined;
  setUserProfile: Dispatch<SetStateAction<UserProfile | undefined>>;
  localStorage: CachingService;
  connectToWeb2Backend: (
    wallet: BeaconWallet,
    userAddress: string,
    publicKey: string,
    localStorage: CachingService
  ) => Promise<void>;
};
export let TzCommunityReactContext =
  React.createContext<TzCommunityReactContextType | null>(null);

export default TzCommunityReactContext;
