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

import * as t from "@onflow/types";
import { sendTransaction } from "./interaction";
import { getManagerAddress } from "./init-manager";
import { getContractCode, getTransactionCode } from "./file";
import { getAccountAddress } from "./create-account";

export const hexContract = (contract) =>
    Buffer.from(contract, "utf8").toString("hex");

/**
 * Looks for a contract in the `basePath` with the given
 * name.
 *
 * @param {to} Address (optional) - If no address is supplied, the contract
 * will be deployed to the emulator service account
 * @param {name} String - The name of the contract to look for. This should match
 * a .cdc file located at the specified `basePath`
 * @param {addressMap} Map (optional) - A map of contract names
 * to contract addresses. Used with `String.replace` to replace hardcoded addresses
 * in Cadence code with addresses generated during testing.
 */
export const deployContractByName = async ({ to, name, addressMap }) => {
  const resolvedAddress = to || (await getAccountAddress());
  const contract = await getContractCode({ name, addressMap });
  return deployContract({ to: resolvedAddress, contract, name });
};

export const deployContract = async ({ to, contract, name }) => {
  // TODO: extract name from contract code
  const managerAddress = await getManagerAddress();
  const contractCode = hexContract(contract);
  const addressMap = {
    FlowManager: managerAddress,
  };

  const code = await getTransactionCode({
    name: "deploy-contract",
    service: true,
    addressMap,
  });

  const args = [
    [name, contractCode, t.String],
    [managerAddress, t.Address],
  ];

  const signers = [to];

  return sendTransaction({
    code,
    args,
    signers,
  });
};
