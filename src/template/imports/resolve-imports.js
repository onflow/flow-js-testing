import {getContractAddress} from "../../interaction/contract"
import {defaultContractsByName} from "../../const"
import {extractImports} from "./imports"

/**
 * Resolves import addresses defined in code template
 * @param {string} code - Cadence template code.
 * @returns {{string:string}} - name/address map
 */
export const resolveImports = async code => {
  const addressMap = {}
  const importList = extractImports(code)
  for (const key in importList) {
    if (defaultContractsByName[key]) {
      addressMap[key] = defaultContractsByName[key]
    } else {
      console.log("ol")
      const address = await getContractAddress(key)
      addressMap[key] = address
    }
  }
  return addressMap
}
