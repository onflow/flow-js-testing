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

import { getTemplate } from "../utils";
import path from "path";
import { defaultsByName } from "../utils/file";

const lowerFirst = (name) => {
  return name[0].toLowerCase() + name.slice(1);
};

export const makeMintTransaction = (name) => {
  const filePath = path.resolve(
    __dirname,
    "./transactions/mint_and_deposit_tokens.cdc"
  );
  const code = getTemplate(filePath);
};

export const makeGetBalance = (name) => {
  const filePath = path.resolve(__dirname, "./scripts/get_balance.cdc");
  const code = getTemplate(filePath);
  const pattern = /(FlowToken)/gi;

  return code.replace(pattern, (match) => {
    return match === "FlowToken" ? name : lowerFirst(name);
  });
};

export const buildAddFungibleTokenReceiverTx = (vaultName) => {
  const filePath = path.resolve(
    __dirname,
    "./transactions/configure_ft_vault.cdc"
  );
  let code = getTemplate(filePath);
  code = code.replace(/\{\{vaultName\}\}/gi, vaultName);
  return code;
};

export const buildCreateEmptyCollectionTx = (collectionName) => {
  const filePath = path.resolve(
    __dirname,
    "./transactions/configure_nft_collection.cdc"
  );
  let code = getTemplate(filePath);
  code = code.replace(/\{\{collectionName\}\}/gi, collectionName);
  return code;
};
