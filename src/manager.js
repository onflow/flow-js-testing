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
import registry from "./generated"
import {getServiceAddress} from "./utils"
import {authorization} from "./crypto"

export const initManager = async () => {
  await registry.contracts.deployFlowManager({
    to: await authorization(),
  })
}

export const getManagerAddress = async () => {
  const serviceAddress = await getServiceAddress()

  const addressMap = {
    FlowManager: serviceAddress,
  }

  const code = await registry.scripts.checkManagerTemplate(addressMap)

  let [result, e] = await executeScript({
    code,
    service: true,
  })
  if (e && result === null) {
    await initManager()
  }

  return getServiceAddress()
}

// TODO: replace method above after Cadence will allow to get contracts list on PublicAccount
/*
export const getManagerAddress = async () => {
  const serviceAddress = await getServiceAddress();

  const code = `
    access(all) fun main(address: Address):Bool {
      return getAccount(address).contracts.get("FlowManager") != null
    }
  `;
  const result = await executeScript({ code, args: [serviceAddress] });

  if (!result) {
    await initManager();
  }

  return serviceAddress;
};
 */

export const getBlockOffset = async () => {
  const FlowManager = await getManagerAddress()
  const code = await registry.scripts.getBlockOffsetTemplate({FlowManager})
  return executeScript({code})
}

export const setBlockOffset = async offset => {
  const FlowManager = await getManagerAddress()

  const args = [offset]
  const code = await registry.transactions.setBlockOffsetTemplate({FlowManager})
  const payer = [FlowManager]

  return sendTransaction({code, args, payer})
}

export const getTimestampOffset = async () => {
  const FlowManager = await getManagerAddress()
  const code = await registry.scripts.getTimestampOffsetTemplate({FlowManager})
  return executeScript({code})
}

export const setTimestampOffset = async offset => {
  const FlowManager = await getManagerAddress()

  const args = [offset]
  const code = await registry.transactions.setTimestampOffsetTemplate({
    FlowManager,
  })
  const payer = [FlowManager]

  return sendTransaction({code, args, payer})
}
