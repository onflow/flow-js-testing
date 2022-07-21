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

export {init} from "./config/init"
export {set, getConfigValue, getServiceAddress} from "./config"
export {
  getTemplate,
  getScriptCode,
  getContractCode,
  getTransactionCode,
} from "./template/file"
export {sendTransaction, executeScript} from "./interaction/interaction"
export {getFlowBalance, mintFlow} from "./interaction/flow-token"
export {deployContract, deployContractByName} from "./interaction/deploy-code"
export {getAccountAddress} from "./interaction/account"
export {
  getBlockOffset,
  setBlockOffset,
  getTimestampOffset,
  setTimestampOffset,
} from "./interaction/manager"
export {getContractAddress} from "./interaction/contract"
export {
  extractImports,
  replaceImportAddresses,
} from "./template/imports/imports"
export {resolveImports} from "./template/imports/resolve-imports"
export {promise, shallPass, shallResolve, shallRevert, shallThrow} from "./util"
export {builtInMethods} from "./template/transformers"

export {default as emulator} from "./emulator"
