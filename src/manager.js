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
import { executeScript, sendTransaction } from "./interaction";
import { config } from "@onflow/config";
import { withPrefix } from "./address";
import { hexContract } from "./deploy-code";
import registry from './generated'

const { FlowManagerTemplate } = registry.contracts
const { initManagerTemplate } = registry.transactions
const { checkManagerTemplate } = registry.scripts

export const initManager = async () => {
  const code = await initManagerTemplate()
  const contractCode = await FlowManagerTemplate()
  const hexedContract = hexContract(contractCode);
  const args = [[hexedContract, t.String]];

  await sendTransaction({
    code,
    args,
  });
};

export const getServiceAddress = async () => {
  return withPrefix(await config().get("SERVICE_ADDRESS"));
};

export const getManagerAddress = async () => {
  const serviceAddress = await getServiceAddress();

  const addressMap = {
    FlowManager: serviceAddress,
  };

  const code = await checkManagerTemplate(addressMap)

  try {
    await executeScript({
      code,
    });
  } catch (e) {
    await initManager();
  }

  return getServiceAddress();
};
