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

import { flowConfig } from "@onflow/fcl-config";
import { config } from "@onflow/config";

export const get = (scope, path, fallback) => {
  if (typeof path === "string") return get(scope, path.split("/"), fallback);
  if (!path.length) return scope;
  try {
    const [head, ...rest] = path;
    return get(scope[head], rest, fallback);
  } catch (_error) {
    return fallback;
  }
};

export const set = (key, env, conf, fallback) => {
  config().put(key, env || get(flowConfig(), conf, fallback));
};

export const getConfigValue = async (param) => {
  return config().get(param)
}
