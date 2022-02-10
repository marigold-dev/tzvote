import React, { useState, Dispatch, SetStateAction } from "react";
import { TezosToolkit, WalletContract } from "@taquito/taquito";

interface ManageProps {
  Tezos: TezosToolkit;
  userAddress: string;
}

const Manage = ({ Tezos, userAddress }: ManageProps) => {
  return <div></div>
};

export default Manage;
