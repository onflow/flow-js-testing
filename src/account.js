/*
 * Flow JS Testing
 *
 * Copyright 2020-2021 Dapper Labs, Inc.
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

import {executeScript, sendTransaction} from "./interaction"
import {getManagerAddress} from "./manager"

import registry from "./generated"
import {config} from "@onflow/fcl"
import {pubFlowKey} from "./crypto"
import {isObject} from "./utils"

export async function createAccount({name, keys}) {
  if (!keys) {
    keys = [
      {
        privateKey: await config().get("PRIVATE_KEY"),
      },
    ]
  }

  // If public key is encoded already, don't change
  // If provided as KeyObject (private key) generate public key
  keys = await Promise.all(
    keys.map(key => (isObject(key) ? pubFlowKey(key) : key))
  )

  const managerAddress = await getManagerAddress()
  const addressMap = {
    FlowManager: managerAddress,
  }

  const code = await registry.transactions.createAccountTemplate(addressMap)
  const args = [name, keys, managerAddress]

  const [result, error] = await sendTransaction({
    code,
    args,
  })
  if (error) throw error
  const {events} = result
  const event = events.find(event => event.type.includes("AccountAdded"))
  const address = event?.data?.address

  return address
}

/**
 * Returns address of account specified by name. If account with that name doesn't exist it will be created
 * and assigned provided name as alias
 * @param {string} accountName - name of the account
 * @returns {Promise<string|*>}
 */
export const getAccountAddress = async accountName => {
  const name =
    accountName ||
    `deployment-account-${(Math.random() * Math.pow(10, 8)).toFixed(0)}`

  const managerAddress = await getManagerAddress()

  const addressMap = {
    FlowManager: managerAddress,
  }

  let accountAddress

  const code = await registry.scripts.getAccountAddressTemplate(addressMap)

  const args = [name, managerAddress]

  const [result] = await executeScript({
    code,
    args,
    service: true,
  })
  accountAddress = result

  if (accountAddress === null) {
    accountAddress = await createAccount({name})
  }
  return accountAddress
}
