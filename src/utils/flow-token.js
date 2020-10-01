import * as types from "@onflow/types";
import { defaultsByName } from "./file";
import { replaceImportAddresses } from "./imports";
import { executeScript, sendTransaction } from "./interaction";
import { makeGetBalance, makeMintTransaction } from "../templates";

export const mintFlow = (recipient, amount) => {
  console.log({ recipient, amount });
  const raw = makeMintTransaction("FlowToken");
  const code = replaceImportAddresses(raw, defaultsByName);
  const args = [
    [recipient, types.Address],
    [amount, types.UFix64],
  ];

  return sendTransaction({ code, args });
};

export const getFlowBalance = async (address) => {
  const raw = makeGetBalance("FlowToken");
  const code = replaceImportAddresses(raw, defaultsByName);
  const args = [[address, types.Address]];
  const balance = await executeScript({ code, args });
  console.log(`Balance of ${address}: ${balance}`);

  return balance;
};
