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
import {authorization} from "../util"
import {extractParameters} from "../template/extract/extract-parameters"

/**
 * Submits transaction to emulator network and waits before it will be sealed.
 * Returns transaction result.
 * @param {string} [props.name] - Name of Cadence template file
 * @param {{string:string}} [props.addressMap={}] - name/address map to use as lookup table for addresses in import statements.
 * @param {string} [props.code] - Cadence code of the transaction.
 * @param {[any]} props.args - array of arguments specified as tupple, where last value is the type of preceding values.
 * @param {[string]} [props.signers] - list of signers, who will authorize transaction, specified as array of addresses.
 * @returns {Promise<any>}
 */

export const sendTransaction = async (...props) => {
  try {
    const extractor = extractParameters("tx")
    const {code, args, signers, limit} = await extractor(props)

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
      const auths = signers.map(address => authorization(address))
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
    const result = await fcl.tx(response).onceExecuted()

    return [result, null]
  } catch (e) {
    return [null, e]
  }
}

/**
 * Sends script code for execution. Returns decoded value
 * @param {string} props.code - Cadence code of the script to be submitted.
 * @param {string} props.name - name of the file to source code from.
 * @param {[any]} props.args - array of arguments specified as tupple, where last value is the type of preceding values.
 * @returns {Promise<*>}
 */

export const executeScript = async (...props) => {
  try {
    const extractor = extractParameters("script")
    const {code, args, limit} = await extractor(props)

    const ix = [fcl.script(code), fcl.limit(limit)]
    // add arguments if any
    if (args) {
      const resolvedArgs = await resolveArguments(args, code)
      ix.push(fcl.args(resolvedArgs))
    }
    const response = await fcl.send(ix)
    const result = await fcl.decode(response)
    return [result, null]
  } catch (e) {
    return [null, e]
  }
}
