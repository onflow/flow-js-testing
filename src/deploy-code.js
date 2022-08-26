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

import {sendTransaction} from "./interaction"
import {getServiceAddress} from "./utils"
import {defaultsByName, getContractCode} from "./file"

import txRegistry from "./generated/transactions"
import {isObject} from "./utils"
import {
  extractContractParameters,
  generateSchema,
  splitArgs,
} from "@onflow/flow-cadut"
import {replaceImportAddresses, resolveImports} from "./imports"
import {applyTransformers, builtInMethods} from "./transformers"

const {updateContractTemplate, deployContractTemplate} = txRegistry

export const hexContract = contract =>
  Buffer.from(contract, "utf8").toString("hex")

const extractParameters = async params => {
  let ixName, ixTo, ixAddressMap, ixArgs, ixUpdate

  if (isObject(params[0])) {
    const [props] = params
    const {name, to, addressMap, args, update} = props

    if (!name) {
      throw Error("'name' field is missing")
    }

    ixName = name
    ixTo = to
    ixArgs = args
    ixAddressMap = addressMap
    ixUpdate = update
  } else {
    ;[ixName, ixTo, ixAddressMap, ixArgs, ixUpdate] = params
  }

  const serviceAddress = await getServiceAddress()
  const addressMap = {
    ...defaultsByName,
    FlowManager: serviceAddress,
    ...ixAddressMap,
  }

  return {
    name: ixName,
    to: ixTo,
    args: ixArgs,
    update: ixUpdate,
    addressMap,
  }
}

/**
 * Deploys a contract by name to specified account
 * Returns transaction result.
 * @param {string} props.to - If no address is supplied, the contract will be deployed to the emulator service account.
 * @param {string} props.name  - The name of the contract to look for. This should match a .cdc file located at the specified `basePath`.
 * @param {{string:string}} [props.addressMap={}] - name/address map to use as lookup table for addresses in import statements.
 * @param {boolean} [props.update=false] - flag to indicate whether the contract shall be replaced.
 * @returns {Promise<any>}
 */
export const deployContractByName = async (...props) => {
  const params = await extractParameters(props)
  const {to, name, addressMap, args, update = false} = params

  const resolvedAddress = to || (await getServiceAddress())
  const contractCode = await getContractCode({name, addressMap})

  const ixName = /[\\/]/.test(name) ? null : name

  return deployContract({
    to: resolvedAddress,
    code: contractCode,
    name: ixName,
    args,
    update,
  })
}

/**
 * Deploys contract as Cadence code to specified account
 * Returns transaction result.
 * @param {Object} props
 * @param {string} props.code - Cadence code for contract to be deployed
 * @param {string} props.to - If no address is supplied, the contract
 * will be deployed to the emulator service account
 * @param {string} props.name  - The name of the contract to look for. This should match
 * a .cdc file located at the specified `basePath`
 * @param {{string:string}} [props.addressMap={}] - name/address map to use as lookup table for addresses in import statements.
 * @param {boolean} [props.update=false] - flag to indicate whether the contract shall be replaced
 * @param {[(code: string) => string]} [props.transformers] - code transformers to apply to contract
 */
export const deployContract = async props => {
  const {
    to,
    code: rawContractCode,
    name,
    args,
    update,
    transformers = [],
  } = props

  const params = await extractContractParameters(rawContractCode)
  const ixName = name || params.contractName

  // TODO: extract name from contract code
  const containerAddress = to || (await getServiceAddress())
  const managerAddress = await getServiceAddress()

  // Resolve contract import addresses
  const deployedContracts = await resolveImports(rawContractCode)
  const serviceAddress = await getServiceAddress()
  const addressMap = {
    ...defaultsByName,
    ...deployedContracts,
    FlowManager: serviceAddress,
  }

  // Replace contract import addresses
  let contractCode = replaceImportAddresses(rawContractCode, addressMap)

  // Apply code transformers
  contractCode = await applyTransformers(contractCode, [
    ...transformers,
    builtInMethods,
  ])

  const hexedCode = hexContract(contractCode)

  let code = update
    ? await updateContractTemplate(addressMap)
    : await deployContractTemplate(addressMap)

  let deployArgs = [ixName, hexedCode, managerAddress]

  if (args) {
    deployArgs = deployArgs.concat(args)
    const schema = generateSchema(params.args).map(item => splitArgs(item)[0])

    const argLetter = "abcdefghijklmnopqrstuvwxyz"
    let argList = []
    for (let i = 0; i < schema.length; i++) {
      const value = schema[i]
      argList.push(`${argLetter[i]}: ${value}`)
    }

    code = code.replace("##ARGS-WITH-TYPES##", `, ${params.args}`)
    code = code.replace("##ARGS-LIST##", argList)
  } else {
    code = code.replace("##ARGS-WITH-TYPES##", ``)
    code = code.replace("##ARGS-LIST##", "")
  }

  const signers = [containerAddress]

  return sendTransaction({
    code,
    args: deployArgs,
    signers,
  })
}
