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

import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";
import { invariant } from "./invariant";
import { authorization, pubFlowKey } from "./crypto";
import { withPrefix } from "./address";
import { executeScript, sendTransaction } from "./interaction";
import { getScriptCode, getTransactionCode } from "./file";
import { getManagerAddress } from "./init-manager";

export const createAccountRPC = async () => {
  const response = await fcl.send([
    fcl.transaction`
      transaction(pubKey: String) {
        prepare(acct: AuthAccount) {
          let account = AuthAccount(payer: acct)
          account.addPublicKey(pubKey.decodeHex())
        }
      }
    `,
    fcl.limit(999),
    fcl.proposer(authorization()),
    fcl.payer(authorization()),
    fcl.authorizations([authorization()]),
    fcl.args([fcl.arg(await pubFlowKey(), t.String)]),
  ]);

  const { events } = await fcl.tx(response).onceExecuted();
  const creationEvent = events.find((d) => d.type === "flow.AccountCreated");
  invariant(creationEvent, "No flow.AccountCreated event emitted", events);
  return withPrefix(creationEvent.data.address);
};

/**
 * Returns address of account specified by name. If account with that name doesn't exist it will be created
 * and assigned provided name as alias
 * @param {string} accountName - name of the account
 * @returns {Promise<string|*>}
 */
export const getAccountAddress = async (accountName) => {
  const name =
    accountName ||
    `deployment-account-${(Math.random() * Math.pow(10, 8)).toFixed(0)}`;

  const managerAddress = await getManagerAddress();

  const addressMap = {
    FlowManager: managerAddress,
  };

  let accountAddress;
  try {
    const code = await getScriptCode({
      name: "get-account-address",
      service: true,
      addressMap,
    });
    const args = [
      [name, t.String],
      [managerAddress, t.Address],
    ];
    accountAddress = await executeScript({
      code,
      args,
    });
  } catch (e) {
    console.error("failed to get account address:", e);
  }

  if (accountAddress === null) {
    try {
      const code = await getTransactionCode({
        name: "create-account",
        service: true,
        addressMap,
      });
      const publicKey = await pubFlowKey();
      const args = [
        [name, publicKey, t.String],
        [managerAddress, t.Address],
      ];
      const { events } = await sendTransaction({
        code,
        args,
      });
      const event = events.find((event) => event.type.includes("AccountAdded"));
      accountAddress = event.data.address;
    } catch (e) {
      console.error(e);
    }
  }

  return accountAddress;
};
