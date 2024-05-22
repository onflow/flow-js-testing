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

import * as fcl from "@onflow/fcl"
import {resolveArguments} from "@onflow/flow-cadut"
import {DEFAULT_COMPUTE_LIMIT} from "./config"
import {authorization} from "./crypto"
import emulator from "./emulator/emulator"
import {getTransactionCode, getScriptCode, defaultsByName} from "./file"
import {resolveImports, replaceImportAddresses} from "./imports"
import {getServiceAddress} from "./utils"
import {applyTransformers, builtInMethods} from "./transformers"
import {isObject} from "./utils"

export const extractParameters = ixType => {
  return async params => {
    let ixCode, ixName, ixSigners, ixArgs, ixService, ixTransformers, ixLimit

    if (isObject(params[0])) {
      const [props] = params
      const {
        name,
        code,
        args,
        signers,
        transformers,
        limit,
        service = false,
      } = props

      ixService = service

      if (!name && !code) {
        throw Error(
          "Both `name` and `code` are missing. Provide either of them"
        )
      }
      ixName = name
      ixCode = code

      ixSigners = signers
      ixArgs = args
      ixTransformers = transformers || []
      ixLimit = limit
    } else {
      if (ixType === "script") {
        ;[ixName, ixArgs, ixLimit, ixTransformers = []] = params
      } else {
        ;[ixName, ixSigners, ixArgs, ixLimit, ixTransformers = []] = params
      }
    }

    // Check that limit is always set
    ixLimit = ixLimit || DEFAULT_COMPUTE_LIMIT

    if (ixName) {
      const getIxTemplate =
        ixType === "script" ? getScriptCode : getTransactionCode
      ixCode = await getIxTemplate({name: ixName})
    }

    // We need a way around to allow initial scripts and transactions for Manager contract
    let deployedContracts
    if (ixService) {
      deployedContracts = defaultsByName
    } else {
      deployedContracts = await resolveImports(ixCode)
    }

    // Resolve default import addresses
    const serviceAddress = await getServiceAddress()
    const addressMap = {
      ...defaultsByName,
      ...deployedContracts,
      FlowManager: serviceAddress,
    }

    // Replace code import addresses
    ixCode = replaceImportAddresses(ixCode, addressMap)

    // Apply all the necessary transformations to the code
    ixCode = await applyTransformers(ixCode, [
      ...ixTransformers,
      builtInMethods,
    ])

    return {
      code: ixCode,
      signers: ixSigners,
      args: ixArgs,
      limit: ixLimit,
    }
  }
}

/**
 * Submits transaction to emulator network and waits before it will be sealed.
 * Returns transaction result.
 * @param {Object} props
 * @param {string} [props.name] - Name of Cadence template file
 * @param {{string:string}} [props.addressMap={}] - name/address map to use as lookup table for addresses in import statements.
 * @param {string} [props.code] - Cadence code of the transaction.
 * @param {[any]} [props.args] - array of arguments specified as tupple, where last value is the type of preceding values.
 * @param {[string]} [props.signers] - list of signers, who will authorize transaction, specified as array of addresses.
 * @returns {Promise<any>}
 */
export const sendTransaction = async (...props) => {
  // This is here to fix an issue with microbundler confusing argument scopes
  let _props = props
  let result = null,
    err = null
  const logs = await captureLogs(async () => {
    try {
      const extractor = extractParameters("tx")
      const {code, args, signers, limit} = await extractor(_props)

      const serviceAuth = authorization()

      // set repeating transaction code
      const ix = [
        fcl.transaction(code),
        fcl.payer(serviceAuth),
        fcl.proposer(serviceAuth),
        fcl.limit(limit),
      ]

      // use signers if specified
      if (signers) {
        const auths = signers.map(signer => authorization(signer))
        ix.push(fcl.authorizations(auths))
      } else {
        // and only service account if no signers
        ix.push(fcl.authorizations([serviceAuth]))
      }

      // add arguments if any
      if (args) {
        const resolvedArgs = await resolveArguments(args, code)
        ix.push(fcl.args(resolvedArgs))
      }
      const response = await fcl.send(ix)
      result = await fcl.tx(response).onceExecuted()
    } catch (e) {
      err = e
    }
  })
  return [result, err, logs]
}

/**
 * Sends script code for execution. Returns decoded value
 * @param {Object} props
 * @param {string} props.code - Cadence code of the script to be submitted.
 * @param {string} props.name - name of the file to source code from.
 * @param {[any]} props.args - array of arguments specified as tuple, where last value is the type of preceding values.
 * @returns {Promise<*>}
 */
export const executeScript = async (...props) => {
  // This is here to fix an issue with microbundler confusing argument scopes
  let _props = props
  let result = null,
    err = null
  const logs = await captureLogs(async () => {
    try {
      const extractor = extractParameters("script")
      const {code, args, limit} = await extractor(_props)

      const ix = [fcl.script(code), fcl.limit(limit)]
      // add arguments if any
      if (args) {
        const resolvedArgs = await resolveArguments(args, code)
        ix.push(fcl.args(resolvedArgs))
      }
      const response = await fcl.send(ix)
      result = await fcl.decode(response)
    } catch (e) {
      err = e
    }
  })
  return [result, err, logs]
}

export const captureLogs = async callback => {
  const logs = []
  const listener = msg => {
    logs.push(msg)
  }
  emulator.logger.on("log", listener)
  await callback()
  await new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, 50)
  })
  emulator.logger.removeListener("log", listener)
  return logs
}
