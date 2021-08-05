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

import * as fcl from "@onflow/fcl";
import { mapValuesToCode } from "flow-cadut";
import { authorization } from "./crypto";
import { getTransactionCode, getScriptCode, defaultsByName } from "./file";
import { resolveImports, replaceImportAddresses } from "./imports";
import { getServiceAddress } from "./manager";
import { isObject } from "./utils";

export const unwrap = (arr, convert) => {
  const type = arr[arr.length - 1];
  return arr.slice(0, -1).map((value) => convert(value, type));
};

const mapArgs = (args) => {
  return args.reduce((acc, arg) => {
    const unwrapped = unwrap(arg, (value, type) => {
      return fcl.arg(value, type);
    });
    acc = [...acc, ...unwrapped];
    return acc;
  }, []);
};

const resolveArguments = (args, code) => {
  if (args.length === 0) {
    return [];
  }

  // We can check first element in array. If it's last value is instance
  // of @onflow/types then we assume that the rest of them are also unprocessed
  const first = args[0];
  if (Array.isArray(first)) {
    const last = first[first.length - 1];
    if (last.asArgument) {
      return mapArgs(args);
    }
  }
  // Otherwise we process them and try to match them against the code
  return mapValuesToCode(code, args);
};

const extractParameters = (ixType) => {
  return async (params) => {
    let ixCode, ixName, ixSigners, ixArgs, ixService;

    if (isObject(params[0])) {
      const [props] = params;
      const { name, code, args, signers, service = false } = props;

      ixService = service;

      if (!name && !code) {
        throw Error("Both `name` and `code` are missing. Provide either of them");
      }
      ixName = name;
      ixCode = code;

      ixSigners = signers;
      ixArgs = args;
    } else {
      if (ixType === "script") {
        [ixName, ixArgs] = params;
      } else {
        [ixName, ixSigners, ixArgs] = params;
      }
    }

    if (ixName) {
      const getIxTemplate = ixType === "script" ? getScriptCode : getTransactionCode;
      ixCode = await getIxTemplate({ name: ixName });
    }

    // We need a way around to allow initial scripts and transactions for Manager contract
    let deployedContracts;
    if (ixService) {
      deployedContracts = defaultsByName;
    } else {
      deployedContracts = await resolveImports(ixCode);
    }

    const serviceAddress = await getServiceAddress();
    const addressMap = {
      ...defaultsByName,
      ...deployedContracts,
      FlowManager: serviceAddress,
    };

    ixCode = replaceImportAddresses(ixCode, addressMap);

    return {
      code: ixCode,
      signers: ixSigners,
      args: ixArgs,
    };
  };
};

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
  const extractor = extractParameters("tx");
  const { code, args, signers } = await extractor(props);

  const serviceAuth = authorization();

  // set repeating transaction code
  const ix = [
    fcl.transaction(code),
    fcl.payer(serviceAuth),
    fcl.proposer(serviceAuth),
    fcl.limit(999),
  ];

  // use signers if specified
  if (signers) {
    const auths = signers.map((address) => authorization(address));
    ix.push(fcl.authorizations(auths));
  } else {
    // and only service account if no signers
    ix.push(fcl.authorizations([serviceAuth]));
  }

  // add arguments if any
  if (args) {
    ix.push(fcl.args(resolveArguments(args, code)));
  }
  const response = await fcl.send(ix);
  return await fcl.tx(response).onceExecuted();
};

/**
 * Sends script code for execution. Returns decoded value
 * @param {string} props.code - Cadence code of the script to be submitted.
 * @param {[any]} props.args - array of arguments specified as tupple, where last value is the type of preceding values.
 * @returns {Promise<*>}
 */
export const executeScript = async (...props) => {
  const extractor = extractParameters("script");
  const { code, args } = await extractor(props);

  const ix = [fcl.script(code)];
  // add arguments if any
  if (args) {
    ix.push(fcl.args(resolveArguments(args, code)));
  }
  const response = await fcl.send(ix);
  return fcl.decode(response);
};
