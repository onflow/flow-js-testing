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

const { expect } = global;

/**
 * Return Promise from passed interaction
 * @param {function | Promise} ix - Promise or function to wrap
 * @returns Promise<*>
 * */
export const promise = async (ix) => {
  if (typeof ix === "function") {
    return await ix();
  }
  return await ix;
};

/**
 * Ensure transaction did not throw and sealed.
 * @param {function | Promise} ix - Promise or function to wrap
 * @returns Promise<*> - transaction result
 * */
export const shallPass = async (ix) => {
  const wrappedInteraction = promise(ix);

  const response = await wrappedInteraction;
  const [result, error] = response;

  if (error) {
    throw error;
  }

  let resolvedStatus;
  let resolvedErrorMessage;
  if (Array.isArray(result)) {
    const { status, errorMessage } = result;
    resolvedStatus = status;
    resolvedErrorMessage = errorMessage;
  } else {
    const { status, errorMessage } = result;
    resolvedStatus = status;
    resolvedErrorMessage = errorMessage;
  }

  await expect(resolvedStatus).toBe(4);
  await expect(resolvedErrorMessage).toBe("");

  return response;
};

/**
 * Ensure interaction did not throw and return result of it
 * @param {function | Promise} ix - Promise or function to wrap
 * @returns Promise<*> - result of interaction
 * */
export const shallResolve = async (ix) => {
  const wrappedInteraction = promise(ix);
  const response = await wrappedInteraction;
  const [, error] = response;
  expect(error).toBe(null);

  return response;
};

/**
 * Ensure interaction throws an error.
 * @param {function | Promise} ix - Promise or function to wrap
 * @returns Promise<*> -  result of interaction
 * */
export const shallRevert = async (ix) => {
  const wrappedInteraction = promise(ix);
  const response = await wrappedInteraction;
  const [result, error] = response;
  await expect(result).toBe(null);
  await expect(error).not.toBe(null);

  return response;
};

/**
 * Ensure interaction throws an error.
 * @param {function | Promise} ix - Promise or function to wrap
 * @returns Promise<*> -  result of interaction
 * */
export const shallThrow = async (ix) => {
  const wrappedInteraction = promise(ix);
  const response = await wrappedInteraction;

  const [result, error] = response;
  await expect(result).toBe(null);
  await expect(error).not.toBe(null);

  return response;
};
