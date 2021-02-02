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
import { unwrap, sendTransaction } from "./interaction";
import { getManagerAddress } from "./init-manager";
import { getContractCode, getTransactionCode } from "./file";
import { getAccountAddress } from "./create-account";
import * as sdk from '@onflow/sdk'

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
export const deployContractByName = async ({ to, name, addressMap, args }) => {
  const resolvedAddress = to || (await getAccountAddress());
  const contractCode = await getContractCode({ name, addressMap });
  return deployContract({ to: resolvedAddress, contractCode, name, args });
};

export const deployContract = async ({ to, contractCode, name, args }) => {
  // TODO: extract name from contract code
  const containerAddress = to || (await getAccountAddress());
  const managerAddress = await getManagerAddress();
  const hexedCode = hexContract(contractCode);
  const addressMap = {
    FlowManager: managerAddress,
  };

  let code = await getTransactionCode({
    name: "deploy-contract",
    service: true,
    addressMap,
  });

  let deployArgs = [
    [name, hexedCode, t.String],
    [managerAddress, t.Address],
  ];

  const argLetter = "abcdefghijklmnopqrstuvwxyz"
  if (args){
    deployArgs = deployArgs.concat(args)

    let i = 0;
    const argsList = [];
    const argsWithTypes = args.reduce((acc, arg) => {
      const unwrapped = unwrap(arg, (value, type) =>{
        const argName = argLetter[i]
        i += 1;
        argsList.push(argName)
        return `${argName}:${type.label}`
      });
      acc = [...acc, ...unwrapped];
      return acc;
    }, []);

    code = code.replace("##ARGS-WITH-TYPES##", `, ${argsWithTypes}`)
    code = code.replace("##ARGS-LIST##", argsList)
  } else {
    code = code.replace("##ARGS-WITH-TYPES##", ``)
    code = code.replace("##ARGS-LIST##", '')
  }

  const signers = [containerAddress];

  return sendTransaction({
    code,
    args: deployArgs,
    signers,
  });
};
