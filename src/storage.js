/*
 * Flow JS Testing
 *
 * Copyright 2020-2023 Dapper Labs, Inc.
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

import {getAccountAddress} from "./account"
import {executeScript} from "./interaction"
import {isAddress, parsePath} from "./utils"

// Helpers
function createSet(acc, pathStruct) {
  acc.add(pathStruct.identifier)
  return acc
}
function reduceToSet(arr) {
  return arr.reduce(createSet, new Set())
}
function reduceToUniqueArray(arr) {
  const set = reduceToSet(arr)
  return Array.from(set)
}
function reduceValues(arr, useSet) {
  if (useSet) {
    return reduceToSet(arr)
  }

  return reduceToUniqueArray(arr)
}
function formatReferences(paths) {
  return Object.keys(paths).reduce((acc, path) => {
    const {slot} = parsePath(path)
    const value = paths[path].type.type

    value.fullType = value.typeID
    value.restrictionsList = new Set(
      value.restrictions.map(item => {
        return item.typeID
      })
    )

    // Extra methods to query restrictions
    value.haveRestrictions = function (query) {
      for (const item of value.restrictionsList) {
        if (item.includes(query)) {
          return true
        }
      }
      return false
    }

    acc[slot] = value

    return acc
  }, {})
}
function formatStorage(paths) {
  return Object.keys(paths).reduce((acc, path) => {
    const {slot} = parsePath(path)
    acc[slot] = paths[path]
    return acc
  }, {})
}
function processValues(result) {
  const publicPaths = formatReferences(result.publicPaths)
  const privatePaths = formatReferences(result.privatePaths)
  const storagePaths = formatStorage(result.storagePaths)

  return {publicPaths, privatePaths, storagePaths}
}

/**
 * Retrieves information about the public, private, and storage paths for a given account.
 *
 * @async
 * @param {string} account - The address or the name of the account to retrieve path information for.
 * @param {boolean} [useSet=true] - Whether to return array or Set
 * @returns {Promise<{
 *   publicPaths: string[] | Set<string>,
 *   privatePaths: string[] | Set<string>,
 *   storagePaths: string[] | Set<string>
 * }>} An object containing arrays or Sets of the public, private, and storage paths for the account.
 */
export async function getPaths(account, useSet = true) {
  let accountAddress = account
  if (!isAddress(accountAddress)) {
    accountAddress = await getAccountAddress(account)
  }

  const [result] = await executeScript({
    code: `
      pub struct PathInfo{
        pub let public: [PublicPath]
        pub let private: [PrivatePath]
        pub let storage: [StoragePath]
        
        init(public: [PublicPath], private: [PrivatePath], storage: [StoragePath]){
          self.public = public
          self.private = private
          self.storage = storage
        }
      }
      pub fun main(address: Address): PathInfo{
        let account = getAuthAccount(address)
        let info = PathInfo(
          public: account.publicPaths, 
          private: account.privatePaths, 
          storage: account.storagePaths
        )
        return info
      }
    `,
    args: [accountAddress],
  })

  return {
    publicPaths: reduceValues(result.public, useSet),
    privatePaths: reduceValues(result.private, useSet),
    storagePaths: reduceValues(result.storage, useSet),
  }
}

/**
 * Retrieves public, private, and storage paths for a given account with extra information available on them
 *
 * @async
 * @param {string} account - The address of the account to retrieve path information for.
 * @returns {Promise<{
 *   publicPaths: {[key: string]: {[key: string]: any}},
 *   privatePaths: {[key: string]: {[key: string]: any}},
 *   storagePaths: {[key: string]: {[key: string]: any}}
 * }>} An object containing objects with the types of the public, private, and storage paths for the account.
 */
export async function getPathsWithType(account) {
  let accountAddress = account
  if (!isAddress(accountAddress)) {
    accountAddress = await getAccountAddress(account)
  }
  const [result] = await executeScript({
    code: `
      pub fun main(address: Address): {String: {String: AnyStruct}} {
        let account = getAuthAccount(address)
        var res: {String: {String: AnyStruct}} = {}
               
        // Iterate over public
        let public: {String: AnyStruct} = {}
        account.forEachPublic(fun (path:PublicPath, type: Type): Bool{
          public[path.toString()] = type
          return true
        })
        
        // Iterate over public
        let private: {String: AnyStruct} = {}
        account.forEachPrivate(fun (path:PrivatePath, type: Type): Bool{
          private[path.toString()] = type
          return true
        })
        
        // Iterate over storage paths
        let storage: {String: AnyStruct} = {}
        account.forEachStored(fun (path:StoragePath, type: Type): Bool{
          storage[path.toString()] = type
          return true
        })
        
        res["publicPaths"] = public
        res["privatePaths"] = private
        res["storagePaths"] = storage
        
        return res
      }
    `,
    args: [accountAddress],
  })

  return processValues(result)
}

/**
 * Retrieves the storage value at a given path for a given account.
 *
 * @async
 * @param {string} account - The address or name of the account to retrieve the storage value from.
 * @param {string} path - The path of the storage value to retrieve.
 * @returns {Promise<any>} The value of the storage at the given path, or `null` if no value is found.
 */
export async function getStorageValue(account, path) {
  let accountAddress = account
  if (!isAddress(accountAddress)) {
    accountAddress = await getAccountAddress(account)
  }

  let fixedPath = path.startsWith("/") ? path.slice(1) : path
  let storagePath = `/storage/${fixedPath}`
  const code = `
    import MetadataViews from 0x1
    
    pub fun main(address: Address, path: StoragePath): AnyStruct{
      let account = getAuthAccount(address)
      
      if let valueType = account.type(at: path) {
        if(valueType.isSubtype(of: Type<@AnyResource>())){
          let obj = account.borrow< auth &AnyResource >(from: path)!
          let meta = obj as? &AnyResource{MetadataViews.ResolverCollection}
        
          if let idList = meta?.getIDs(){
            if(idList.length > 0){
              let res: {UInt64: AnyStruct} = {}
            
              for id in idList {
                res[id] = meta!.borrowViewResolver(id: id).resolveView(Type<MetadataViews.Display>())!
              }
              return res
            }
          }
          
          let value = account.borrow< &AnyResource >(from: path)! as AnyStruct
          return value  
        }
        
        let value = account.borrow< &AnyStruct >(from: path)! as AnyStruct
        return value  
      }
      
      return nil
    }
  `
  const args = [accountAddress, storagePath]

  const [values] = await executeScript({code, args})
  return values
}

/**
 * Retrieves the storage statistics (used and capacity) for a given account.
 *
 * @async
 * @param {string} address - The address of the account to retrieve storage statistics for.
 * @param {boolean} [convert=true] - Whether to convert the returned statistics from `UInt64` to `number`.
 * @returns {Promise<{
 *   used: number | string,
 *   capacity: number | string
 * }>} An object containing the used and capacity storage statistics for the account.
 */
export async function getStorageStats(address, convert = true) {
  let accountAddress = address
  if (!isAddress(accountAddress)) {
    accountAddress = await getAccountAddress(address)
  }

  const [result] = await executeScript({
    code: `
      pub fun main(address: Address): {String: UInt64} {
        let account = getAuthAccount(address)
        
        return {
          "used": account.storageUsed,
          "capacity": account.storageCapacity
        }
      }
    `,
    args: [accountAddress],
  })

  if (convert) {
    return {
      used: parseInt(result.used),
      capacity: parseInt(result.capacity),
    }
  }

  return result
}
