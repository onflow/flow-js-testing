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
import { getContractCode, getScriptCode, getTransactionCode } from "./file";
import { pubFlowKey } from "./crypto";
import { executeScript, sendTransaction } from "./interaction";
import { config } from "@onflow/config";
import { withPrefix } from "./address";
import { invariant } from "./invariant";
import { set } from "./config";
import { hexContract } from "./deploy-code";

export const initManager = async () => {
  const code = await getTransactionCode({
    name: "init-manager",
    service: true,
  });

  const contractCode = await getContractCode({
    name: "FlowManager",
    service: true,
  });

  const hexedContract = hexContract(contractCode);
  const pubKey = await pubFlowKey();
  const args = [[pubKey, hexedContract, t.String]];

  const { events } = await sendTransaction({
    code,
    args,
  });

  const creationEvent = events.find((d) => d.type === "flow.AccountCreated");
  invariant(creationEvent, "No flow.AccountCreated event emitted", events);
  return withPrefix(creationEvent.data.address);
};

export const getManagerAddress = async () => {
  let managerAddress = await config().get("MANAGER_ADDRESS");

  if (!managerAddress) {
    const serviceAddress = withPrefix(await config().get("SERVICE_ADDRESS"));
    const code = await getScriptCode({
      name: "get-manager-address",
      service: true,
    });

    try {
      managerAddress = await executeScript({
        code,
        args: [[serviceAddress, t.Address]],
      });
      return managerAddress;
    } catch (e) {
      managerAddress = await initManager();

      set(
        "MANAGER_ADDRESS",
        process.env.MANAGER_ADDRESS,
        "accounts/manager/address",
        managerAddress
      );
      return managerAddress;
    }
  }
  return managerAddress;
};
