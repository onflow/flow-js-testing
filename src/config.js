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

/**
 * Get value from provided scope and path.
 * @param scope - scope value.
 * @param path - value path in config (flow.json) file.
 * @param fallback - fallback value.
 * @returns {*} - value at specified scope and path.
 */
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

/**
 * Set globally available config value.
 * @param {string} key - key to be used to access stored value.
 * @param {string} env - value key in the environment (for example .env file).
 * @param {string} conf - value path in config (flow.json) file.
 * @param fallback - fallback value to be used if env and conf are absent.
 */
export const set = (key, env, conf, fallback) => {
  let value = get(flowConfig(), conf, fallback);
  if (!value) {
    value = fallback;
  }
  config().put(key, value);
};

/**
 * Returns config value at specified key.
 * @param key - key to the value.
 * @returns {Promise<*>} - value at specified key.
 */
export const getConfigValue = async (key) => {
  return config().get(key);
};
