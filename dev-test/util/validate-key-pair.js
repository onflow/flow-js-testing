import {ec as EC} from "elliptic"
import {isString} from "../../src/utils"

export function validateKeyPair(publicKey, privateKey, curve = "p256") {
  const prepareKey = key => {
    if (isString(key)) key = Buffer.from(key, "hex")
    if (key.at(0) !== 0x04) key = Buffer.concat([Buffer.from([0x04]), key])
    return key
  }

  publicKey = prepareKey(publicKey)
  privateKey = prepareKey(privateKey)

  const ec = new EC(curve)
  const pair = ec.keyPair({
    pub: publicKey,
    priv: privateKey,
  })

  return pair.validate()?.result ?? false
}
