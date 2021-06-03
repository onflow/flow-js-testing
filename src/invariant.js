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

export const invariant = (fact, msg, ...rest) => {
  if (!fact) {
    const error = new Error(`INVARIANT ${msg}`);
    error.stack = error.stack
      .split("\n")
      .filter((d) => !/at invariant/.test(d))
      .join("\n");
    console.error("\n\n---\n\n", error, "\n\n", ...rest, "\n\n---\n\n");
    throw error;
  }
};
