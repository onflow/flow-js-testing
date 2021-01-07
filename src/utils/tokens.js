/*
 * Flow JS Testing
 *
 * Copyright 2020 Dapper Labs, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as types from "@onflow/types";
import { defaultsByName } from "./file";
import { replaceImportAddresses } from "./imports";
import { executeScript, sendTransaction } from "./interaction";
import {
  makeGetBalance,
  makeMintTransaction,
  buildAddFungibleTokenReceiverTx,
  buildCreateEmptyCollectionTx,
} from "../templates";

export const mintFlow = (recipient, amount) => {
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

  return balance;
};

export const createFTVaultResourceForAcct = async (
  acct,
  contract,
  vaultName
) => {
  const raw = buildAddFungibleTokenReceiverTx(vaultName);
  const code = replaceImportAddresses(raw, { FungibleToken: contract.address });
  const result = await sendTransaction({ code, signers: [acct.address] });

  return result;
};

export const createNFTCollectionResourceForAcct = async (
  acct,
  contract,
  collectionName
) => {
  const raw = buildCreateEmptyCollectionTx(collectionName);

  const code = replaceImportAddresses(raw, {
    NonFungibleToken: contract.address,
  });

  const result = await sendTransaction({ code, signers: [acct.address] });

  return result;
};
