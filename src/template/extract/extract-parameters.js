import {getTransactionCode, getScriptCode} from "../file"
import {defaultContractsByName, DEFAULT_COMPUTE_LIMIT} from "../../const"
import {replaceImportAddresses} from "../imports/imports"
import {resolveImports} from "../imports/resolve-imports"
import {getServiceAddress} from "../../config"
import {isObject} from "../../util"

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
        ;[ixName, ixArgs, ixLimit, ixTransformers] = params
      } else {
        ;[ixName, ixSigners, ixArgs, ixLimit, ixTransformers] = params
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
      deployedContracts = defaultContractsByName
    } else {
      deployedContracts = await resolveImports(ixCode)
    }

    const serviceAddress = await getServiceAddress()
    const addressMap = {
      ...defaultContractsByName,
      ...deployedContracts,
      FlowManager: serviceAddress,
    }

    ixCode = replaceImportAddresses(ixCode, addressMap)

    // Apply all the necessary transformations to the code
    for (const i in ixTransformers) {
      const transformer = ixTransformers[i]
      ixCode = await transformer(ixCode)
    }

    return {
      code: ixCode,
      signers: ixSigners,
      args: ixArgs,
      limit: ixLimit,
    }
  }
}
