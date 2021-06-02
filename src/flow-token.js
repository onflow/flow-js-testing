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
import { makeGetBalance, makeMintTransaction } from "./templates";

/**
 * Returns current FlowToken balance of account specified by address
 * @param {string} address - address of account to check
 * @returns {Promise<*>}
 */
export const getFlowBalance = async (address) => {
  const raw = await makeGetBalance("FlowToken");
  const code = replaceImportAddresses(raw, defaultsByName);
  const args = [[address, types.Address]];

  return executeScript({ code, args });
};

/**
 * Sends transaction to mint specified amount of FlowToken and send it to recipient.
 * Returns result of the transaction.
 * @param {string} recipient - address of recipient account
 * @param {string} amount - amount to mint and send
 * @returns {Promise<*>}
 */
export const mintFlow = async (recipient, amount) => {
  const raw = await makeMintTransaction("FlowToken");
  const code = replaceImportAddresses(raw, defaultsByName);
  const args = [
    [recipient, types.Address],
    [amount, types.UFix64],
  ];

  return sendTransaction({ code, args });
};
