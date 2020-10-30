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

import path from "path";
import { config } from "@onflow/config";

const SCRIPT = "./scripts/";
const TRANSACTION = "./transactions/";
const CONTRACT = "./contracts/";

export const templateType = {
  SCRIPT,
  TRANSACTION,
  CONTRACT,
};

export const getPath = async (name, type = TRANSACTION, serviceCode) => {
  const configBase = await config().get("BASE_PATH");
  const basePath = serviceCode ? __dirname : configBase;
  return path.resolve(basePath || __dirname, `${type}/${name}.cdc`);
};
