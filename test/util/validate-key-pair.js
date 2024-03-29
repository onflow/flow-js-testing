import {resolveSignAlgoKey, ec, SignatureAlgorithm} from "../../src/crypto"
import {isString} from "../../src/utils"

export function validateKeyPair(
  publicKey,
  privateKey,
  signatureAlgorithm = SignatureAlgorithm.P256
) {
  const signAlgoKey = resolveSignAlgoKey(signatureAlgorithm)

  const prepareKey = key => {
    if (isString(key)) key = Buffer.from(key, "hex")
    if (key.at(0) !== 0x04) key = Buffer.concat([Buffer.from([0x04]), key])
    return key
  }

  publicKey = prepareKey(publicKey)
  privateKey = prepareKey(privateKey)

  const pair = ec[signAlgoKey].keyPair({
    pub: publicKey,
    priv: privateKey,
  })

  return pair.validate()?.result ?? false
}
