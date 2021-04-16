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

import { set } from "./config";

export const init = async (basePath) => {
  set("PRIVATE_KEY", process.env.PK, "accounts/emulator-account/keys");
  set(
    "SERVICE_ADDRESS",
    process.env.SERVICE_ADDRESS,
    "accounts/emulator-account/address",
    "f8d6e0586b0a20c7"
  );
  set(
    "accessNode.api",
    process.env.ACCESS_NODE,
    "wallet/accessNode",
    "http://localhost:8080"
  );

  set("BASE_PATH", process.env.BASE_PATH, "resolve/basePath", basePath);
};
