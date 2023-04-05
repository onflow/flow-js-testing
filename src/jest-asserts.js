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

import {getPaths, getStorageValue} from "./storage"
import {getValueByKey, parsePath} from "./utils"

const {expect} = global

/**
 * Return Promise from passed interaction
 * @param {function | Promise} ix - Promise or function to wrap
 * @returns Promise<*>
 * */
export const promise = async ix => {
  if (typeof ix === "function") {
    return await ix()
  }
  return await ix
}

/**
 * Ensure transaction did not throw and sealed.
 * @param {function | Promise} ix - Promise or function to wrap
 * @returns Promise<*> - transaction result
 * */
export const shallPass = async ix => {
  const wrappedInteraction = promise(ix)

  const response = await wrappedInteraction
  const [result, error] = response

  if (error) {
    throw error
  }

  let resolvedStatus
  let resolvedErrorMessage
  if (Array.isArray(result)) {
    const {status, errorMessage} = result
    resolvedStatus = status
    resolvedErrorMessage = errorMessage
  } else {
    const {status, errorMessage} = result
    resolvedStatus = status
    resolvedErrorMessage = errorMessage
  }

  await expect(resolvedStatus).toBe(4)
  await expect(resolvedErrorMessage).toBe("")

  return response
}

/**
 * Ensure interaction did not throw and return result of it
 * @param {function | Promise} ix - Promise or function to wrap
 * @returns Promise<*> - result of interaction
 * */
export const shallResolve = async ix => {
  const wrappedInteraction = promise(ix)
  const response = await wrappedInteraction
  const [, error] = response
  expect(error).toBe(null)

  return response
}

/**
 * Ensure interaction throws an error.
 * @param {function | Promise} ix - Promise or function to wrap
 * @param {string | RegExp} [message] - Expected error message provided as either a string equality or regular expression
 * @returns Promise<*> -  result of interaction
 * */
export const shallRevert = async (ix, message) => {
  const wrappedInteraction = promise(ix)
  const response = await wrappedInteraction
  const [result, error] = response

  await expect(result).toBe(null)

  if (message) {
    const errorMessage = error
      .toString()
      .match(/^error: (panic)|(assertion failed): ([^\r\n]*)$/m)
      ?.at(3)
    if (message instanceof RegExp) {
      await expect(errorMessage).toMatch(message)
    } else {
      await expect(errorMessage).toBe(message)
    }
  } else {
    await expect(error).not.toBe(null)
  }

  return response
}

/**
 * Ensure interaction throws an error.
 * @param {function | Promise} ix - Promise or function to wrap
 * @returns Promise<*> -  result of interaction
 * */
export const shallThrow = async ix => {
  const wrappedInteraction = promise(ix)
  const response = await wrappedInteraction

  const [result, error] = response
  await expect(result).toBe(null)
  await expect(error).not.toBe(null)

  return response
}

/**
 * Asserts that the given account has the given path enabled.
 *
 * @async
 * @param {string} account - The address or name of the account to check for the path.
 * @param {string} path - The path to check for.
 * @returns {Promise<void>} A Promise that resolves when the assertion is complete, or rejects with an error if the assertion fails.
 */
export const shallHavePath = async (account, path) => {
  let parsedPath
  expect(() => {
    parsedPath = parsePath(path)
  }).not.toThrowError()

  const {domain, slot} = parsedPath
  const paths = await getPaths(account)
  const key = `${domain}Paths`
  const hasPathEnabled = paths[key].has(slot)

  await expect(hasPathEnabled).toBe(true)
}

/**
 * Asserts that the given account has the expected storage value at the given path.
 *
 * @async
 * @param {string} account - The address or name of the account to check for the storage value.
 * @param {{pathName: string, key?: string, expect: any}} params - An object containing the path name, optional key, and expected value.
 * @returns {Promise<void>} A Promise that resolves when the assertion is complete, or rejects with an error if the assertion fails.
 */
export const shallHaveStorageValue = async (account, params) => {
  const {pathName, key} = params

  const storageValue = await getStorageValue(account, pathName)

  if (key) {
    const actualValue = getValueByKey(key, storageValue)
    expect(actualValue).toBe(params.expect)
  } else {
    expect(storageValue).toBe(params.expect)
  }
}
