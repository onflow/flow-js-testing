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

import * as rlp from "rlp"
import {ec as EC} from "elliptic"
import {config} from "@onflow/config"
import {isObject, isString} from "./utils"

import {sha3_256} from "js-sha3"
import {sha256 as sha2_256} from "js-sha256"

export const SignatureAlgorithm = {
  ECDSA_P256: 2,
  ECDSA_secp256k1: 3,
}

export const HashAlgorithm = {
  SHA2_256: 1,
  SHA3_256: 3,
}

export const HashAlgoFnMap = {
  SHA2_256: sha2_256,
  SHA3_256: sha3_256,
}

export const SignAlgoECMap = {
  ECDSA_P256: "p256",
  ECDSA_secp256k1: "secp256k1",
}

export const resolveHashAlgoKey = hashAlgorithm => {
  const hashAlgorithmKey = Object.keys(HashAlgorithm).find(
    x =>
      HashAlgorithm[x] === hashAlgorithm ||
      (isString(hashAlgorithm) &&
        x.toLowerCase() === hashAlgorithm.toLowerCase())
  )
  if (!hashAlgorithmKey)
    throw new Error(
      `Provided hash algorithm "${hashAlgorithm}" is not currently supported`
    )
  return hashAlgorithmKey
}

export const resolveSignAlgoKey = signatureAlgorithm => {
  const signatureAlgorithmKey = Object.keys(SignatureAlgorithm).find(
    x =>
      SignatureAlgorithm[x] === signatureAlgorithm ||
      (isString(signatureAlgorithm) &&
        x.toLowerCase() === signatureAlgorithm.toLowerCase())
  )
  if (!signatureAlgorithmKey)
    throw new Error(
      `Provided signature algorithm "${signatureAlgorithm}" is not currently supported`
    )
  return signatureAlgorithmKey
}

const hashMsgHex = (msgHex, hashAlgorithm = HashAlgorithm.SHA3_256) => {
  const hashAlgorithmKey = resolveHashAlgoKey(hashAlgorithm)
  const hashFn = HashAlgoFnMap[hashAlgorithmKey]

  const hash = hashFn.create()
  hash.update(Buffer.from(msgHex, "hex"))
  return Buffer.from(hash.arrayBuffer())
}

export const signWithKey = (
  privateKey,
  msgHex,
  hashAlgorithm = HashAlgorithm.SHA3_256,
  signatureAlgorithm = SignatureAlgorithm.ECDSA_P256
) => {
  const signatureAlgorithmKey = resolveSignAlgoKey(signatureAlgorithm)
  const curve = SignAlgoECMap[signatureAlgorithmKey]

  const ec = new EC(curve)
  const key = ec.keyFromPrivate(Buffer.from(privateKey, "hex"))
  const sig = key.sign(hashMsgHex(msgHex, hashAlgorithm))
  const n = 32 // half of signature length?
  const r = sig.r.toArrayLike(Buffer, "be", n)
  const s = sig.s.toArrayLike(Buffer, "be", n)
  return Buffer.concat([r, s]).toString("hex")
}

export const authorization =
  signer =>
  async (account = {}) => {
    const serviceAddress = await config().get("SERVICE_ADDRESS")

    let addr = serviceAddress,
      keyId = 0,
      privateKey = await config().get("PRIVATE_KEY"),
      hashAlgorithm = HashAlgorithm.SHA3_256,
      signatureAlgorithm = SignatureAlgorithm.ECDSA_P256

    if (isObject(signer)) {
      ;({
        addr = addr,
        keyId = keyId,
        privateKey = privateKey,
        hashAlgorithm = hashAlgorithm,
        signatureAlgorithm = signatureAlgorithm,
      } = signer)
    } else {
      addr = signer || addr
    }

    const signingFunction = async data => ({
      keyId,
      addr: addr,
      signature: signWithKey(
        privateKey,
        data.message,
        hashAlgorithm,
        signatureAlgorithm
      ),
    })

    return {
      ...account,
      addr,
      keyId,
      signingFunction,
    }
  }

export const pubFlowKey = async ({
  privateKey,
  hashAlgorithm = HashAlgorithm.SHA3_256,
  signatureAlgorithm = SignatureAlgorithm.ECDSA_P256,
  weight = 1000, // give key full weight
}) => {
  // Converty hex string private key to buffer if not buffer already
  if (!Buffer.isBuffer(privateKey)) privateKey = Buffer.from(privateKey, "hex")

  const hashAlgoName = resolveHashAlgoKey(hashAlgorithm)
  const sigAlgoName = resolveSignAlgoKey(signatureAlgorithm)

  const curve = SignAlgoECMap[sigAlgoName]

  const ec = new EC(curve)
  const keys = ec.keyFromPrivate(privateKey)
  const publicKey = keys.getPublic("hex").replace(/^04/, "")
  return rlp
    .encode([
      Buffer.from(publicKey, "hex"), // publicKey hex to binary
      SignatureAlgorithm[sigAlgoName],
      HashAlgorithm[hashAlgoName],
      weight,
    ])
    .toString("hex")
}
