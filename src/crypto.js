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
import {config, account} from "@onflow/fcl"
import {ec as EC} from "elliptic"
import {getServiceAddress, isObject, isString} from "./utils"
import {invariant} from "./invariant"

import {sha3_256} from "js-sha3"
import {sha256 as sha2_256} from "js-sha256"

/**
 * Represents a signature for an arbitrary message generated using a particular key
 * @typedef {Object} SignatureObject
 * @property {string} addr address of account whose key was used to sign the message
 * @property {number} keyId key index on the account of they key used to sign the message
 * @property {string} signature signature corresponding to the signed message hash as hex-encoded string
 */

/**
 * Represents a private key object which may be used to generate a public key
 * @typedef {Object} KeyObject
 * @property {string | Buffer} privateKey private key for this key object
 * @property {SignatureAlgorithm} [signatureAlgorithm=SignatureAlgorithm.ECDSA_P256] signing algorithm used with this key
 * @property {HashAlgorithm} [hashAlgorithm=HashAlgorithm.SHA3_256] hash algorithm used with this key
 * @property {weight} [weight=1000] desired weight of this key (default full weight)
 */

/**
 * Represents a signer of a message or transaction
 * @typedef {Object} SignerInfoObject
 * @property {string} addr address of the signer
 * @property {HashAlgorithm} [hashAlgorithm=HashAlgorithm.SHA3_256] hash algorithm used to hash the message before signing
 * @property {SignatureAlgorithm} [signatureAlgorithm=SignatureAlgorithm.ECDSA_P256] signing algorithm used to generate the signature
 * @property {number} [keyId=0] index of the key on the signers account to use
 * @property {string | Buffer} [privateKey=SERVICE_KEY] private key of the signer (defaults to universal private key/service key from config)
 */

/**
 * Enum for signing algorithms
 * @readonly
 * @enum {number}
 */
export const SignatureAlgorithm = {
  ECDSA_P256: 1,
  ECDSA_secp256k1: 2,
}

/**
 * Enum for hasing algorithms
 * @readonly
 * @enum {number}
 */
export const HashAlgorithm = {
  SHA2_256: 1,
  SHA3_256: 3,
}

/**
 * Enum for mapping hash algorithm name to hashing function
 * @readonly
 * @enum {function}
 */
export const HashFunction = {
  SHA2_256: sha2_256,
  SHA3_256: sha3_256,
}

/**
 * Enum for mapping signature algorithm to elliptic instance
 * @readonly
 * @enum {EC}
 */
export const ec = {
  ECDSA_P256: new EC("p256"),
  ECDSA_secp256k1: new EC("secp256k1"),
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
  const hashFn = HashFunction[hashAlgorithmKey]

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
  const signAlgo = resolveSignAlgoKey(signatureAlgorithm)

  const key = ec[signAlgo].keyFromPrivate(Buffer.from(privateKey, "hex"))
  const sig = key.sign(hashMsgHex(msgHex, hashAlgorithm))
  const n = 32 // half of signature length?
  const r = sig.r.toArrayLike(Buffer, "be", n)
  const s = sig.s.toArrayLike(Buffer, "be", n)
  return Buffer.concat([r, s]).toString("hex")
}

export const resolveSignerKey = async signer => {
  let addr = await getServiceAddress(),
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

  return {
    addr,
    keyId,
    privateKey,
    hashAlgorithm,
    signatureAlgorithm,
  }
}

export const authorization =
  signer =>
  async (account = {}) => {
    const {addr, keyId, privateKey, hashAlgorithm, signatureAlgorithm} =
      await resolveSignerKey(signer)

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

/**
 * Returns an RLP-encoded public key for a particular private key as a hex-encoded string
 * @param {KeyObject} keyObject
 * @param {string | Buffer} keyObject.privateKey private key as hex-encoded string or Buffer
 * @param {HashAlgorithm | string} [keyObject.hashAlgorithm=HashAlgorithm.SHA3_256] hasing algorithnm used to hash messages using this key
 * @param {SignatureAlgorithm | string} [keyObject.signatureAlgorithm=SignatureAlgorithm.ECDSA_P256] signing algorithm used to generate signatures using this key
 * @param {number} [keyObject.weight=1000] weight of the key
 * @returns {string}
 */
export const pubFlowKey = async (keyObject = {}) => {
  let {
    privateKey = await config().get("PRIVATE_KEY"),
    hashAlgorithm = HashAlgorithm.SHA3_256,
    signatureAlgorithm = SignatureAlgorithm.ECDSA_P256,
    weight = 1000, // give key full weight
  } = keyObject

  // Convert hex string private key to buffer if not buffer already
  if (!Buffer.isBuffer(privateKey)) privateKey = Buffer.from(privateKey, "hex")

  const hashAlgoName = resolveHashAlgoKey(hashAlgorithm)
  const sigAlgoName = resolveSignAlgoKey(signatureAlgorithm)

  const keys = ec[sigAlgoName].keyFromPrivate(privateKey)
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

export const prependDomainTag = (msgHex, domainTag) => {
  const rightPaddedBuffer = buffer =>
    Buffer.concat([Buffer.alloc(32 - buffer.length, 0), buffer])
  let domainTagBuffer = rightPaddedBuffer(Buffer.from(domainTag, "utf-8"))
  return domainTagBuffer.toString("hex") + msgHex
}

/**
 * Signs a user message for a given signer
 * @param {string | Buffer} msgHex hex-encoded string or Buffer of the message to sign
 * @param {string | SignerInfoObject} signer signer address provided as string and JS Testing signs with universal private key/service key or signer info provided manually via SignerInfoObject
 * @param {string} domainTag utf-8 domain tag to use when hashing message
 * @returns {SignatureObject} signature object which can be validated using verifyUserSignatures
 */
export const signUserMessage = async (msgHex, signer, domainTag) => {
  if (Buffer.isBuffer(msgHex)) msgHex.toString("hex")

  const {addr, keyId, privateKey, hashAlgorithm, signatureAlgorithm} =
    await resolveSignerKey(signer, true)

  if (domainTag) {
    msgHex = prependDomainTag(msgHex, domainTag)
  }

  return {
    keyId,
    addr: addr,
    signature: signWithKey(
      privateKey,
      msgHex,
      hashAlgorithm,
      signatureAlgorithm
    ),
  }
}

/**
 * Verifies whether user signatures were valid for a particular message hex
 * @param {string | Buffer} msgHex hex-encoded string or buffer of message to verify
 * @param {[SignatureObject]} signatures array of signatures to verify against msgHex
 * @param {string} [domainTag=""] utf-8 domain tag to use when hashing message
 * @returns {boolean} true if signatures are valid and total weight >= 1000
 */
export const verifyUserSignatures = async (
  msgHex,
  signatures,
  domainTag = ""
) => {
  if (Buffer.isBuffer(msgHex)) msgHex = msgHex.toString("hex")

  invariant(signatures, "One or mores signatures must be provided")

  // convert to array
  signatures = [].concat(signatures)

  invariant(signatures.length > 0, "One or mores signatures must be provided")

  invariant(
    signatures.reduce(
      (valid, sig) =>
        valid && sig.signature != null && sig.keyId != null && sig.addr != null,
      true
    ),
    "One or more signature is invalid.  Valid signatures have the following keys: addr, keyId, siganture"
  )

  const address = signatures[0].addr
  invariant(
    signatures.reduce((same, sig) => same && sig.addr === address, true),
    "Signatures must belong to the same address"
  )

  const keys = (await account(address)).keys

  const largestKeyId = Math.max(...signatures.map(sig => sig.keyId))
  invariant(
    largestKeyId < keys.length,
    `Key index ${largestKeyId} does not exist on account ${address}`
  )

  // Apply domain tag if needed
  if (domainTag) {
    msgHex = prependDomainTag(msgHex, domainTag)
  }

  let totalWeight = 0
  for (let i in signatures) {
    const {signature, keyId} = signatures[i]
    const {
      hashAlgoString: hashAlgo,
      signAlgoString: signAlgo,
      weight,
      publicKey,
      revoked,
    } = keys[keyId]

    const key = ec[signAlgo].keyFromPublic(Buffer.from("04" + publicKey, "hex"))

    if (revoked) return false

    const msgHash = hashMsgHex(msgHex, hashAlgo)
    const sigBuffer = Buffer.from(signature, "hex")
    const signatureInput = {
      r: sigBuffer.slice(0, 32),
      s: sigBuffer.slice(-32),
    }

    if (!key.verify(msgHash, signatureInput)) return false

    totalWeight += weight
  }
  return totalWeight >= 1000
}
