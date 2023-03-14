import {config} from "@onflow/fcl"
import {
  createAccount,
  emulator,
  getAccountAddress,
  getServiceAddress,
  init,
  signUserMessage,
  verifyUserSignatures,
} from "../../src"
import {
  prependDomainTag,
  resolveHashAlgoKey,
  resolveSignAlgoKey,
} from "../../src/crypto"

describe("cryptography tests", () => {
  beforeEach(async () => {
    await init()
    return emulator.start()
  })

  afterEach(async () => {
    return emulator.stop()
  })

  test("signUserMessage - sign with address", async () => {
    const Alice = await getAccountAddress("Alice")
    const msgHex = "a1b2c3"

    const signature = await signUserMessage(msgHex, Alice)

    expect(Object.keys(signature).length).toBe(3)
    expect(signature.addr).toBe(Alice)
    expect(signature.keyId).toBe(0)
    expect(await verifyUserSignatures(msgHex, [signature])).toBe(true)
  })

  test("signUserMessage - sign with KeyObject", async () => {
    const hashAlgorithm = "SHA3_256"
    const signatureAlgorithm = "ECDSA_P256"

    const privateKey = "1234"
    const Adam = await createAccount({
      name: "Adam",
      keys: [
        {
          privateKey,
          hashAlgorithm,
          signatureAlgorithm,
          weight: 1000,
        },
      ],
    })

    const signer = {
      addr: Adam,
      keyId: 0,
      privateKey,
      hashAlgorithm,
      signatureAlgorithm,
    }

    const msgHex = "a1b2c3"
    const signature = await signUserMessage(msgHex, signer)

    expect(Object.keys(signature).length).toBe(3)
    expect(signature.addr).toBe(Adam)
    expect(signature.keyId).toBe(0)
    expect(await verifyUserSignatures(msgHex, [signature])).toBe(true)
  })

  test("signUserMessage - sign with domain separation tag", async () => {
    const Alice = await getAccountAddress("Alice")
    const msgHex = "a1b2c3"

    const signature = await signUserMessage(msgHex, Alice, "foo")

    expect(Object.keys(signature).length).toBe(3)
    expect(signature.addr).toBe(Alice)
    expect(signature.keyId).toBe(0)
    expect(await verifyUserSignatures(msgHex, [signature], "foo")).toBe(true)
  })

  test("signUserMessage - sign with service key", async () => {
    const Alice = await getServiceAddress()
    const msgHex = "a1b2c3"

    const signature = await signUserMessage(msgHex, Alice)

    expect(Object.keys(signature).length).toBe(3)
    expect(signature.addr).toBe(Alice)
    expect(signature.keyId).toBe(0)
    expect(await verifyUserSignatures(msgHex, [signature])).toBe(true)
  })

  test("verifyUserSignature & signUserMessage - work with Buffer messageHex", async () => {
    const Alice = await getAccountAddress("Alice")
    const msgHex = Buffer.from([0xa1, 0xb2, 0xc3])
    const signature = await signUserMessage(msgHex, Alice)

    expect(await verifyUserSignatures(msgHex, [signature])).toBe(true)
  })

  test("verifyUserSignature - fails with bad signature", async () => {
    const Alice = await getAccountAddress("Alice")
    const msgHex = "a1b2c3"

    const badSignature = {
      addr: Alice,
      keyId: 0,
      signature: "a1b2c3",
    }

    expect(await verifyUserSignatures(msgHex, [badSignature])).toBe(false)
  })

  test("verifyUserSignature - fails if weight < 1000", async () => {
    const Alice = await createAccount({
      name: "Alice",
      keys: [
        {
          privateKey: await config().get("PRIVATE_KEY"),
          weight: 123,
        },
      ],
    })
    const msgHex = "a1b2c3"
    const signature = await signUserMessage(msgHex, Alice)

    expect(await verifyUserSignatures(msgHex, [signature])).toBe(false)
  })

  test("verifyUserSignatures - throws with null signature object", async () => {
    const msgHex = "a1b2c3"

    await expect(verifyUserSignatures(msgHex, null)).rejects.toThrow(
      "INVARIANT One or mores signatures must be provided"
    )
  })

  test("verifyUserSignatures - throws with no signatures in array", async () => {
    const msgHex = "a1b2c3"

    await expect(verifyUserSignatures(msgHex, [])).rejects.toThrow(
      "INVARIANT One or mores signatures must be provided"
    )
  })

  test("verifyUserSignatures - throws with different account signatures", async () => {
    const Alice = await getAccountAddress("Alice")
    const Bob = await getAccountAddress("Bob")
    const msgHex = "a1b2c3"

    const signatureAlice = await signUserMessage(msgHex, Alice)
    const signatureBob = await signUserMessage(msgHex, Bob)

    await expect(
      verifyUserSignatures(msgHex, [signatureAlice, signatureBob])
    ).rejects.toThrow("INVARIANT Signatures must belong to the same address")
  })

  test("verifyUserSignatures - throws with invalid signature format", async () => {
    const msgHex = "a1b2c3"
    const signature = {
      foo: "bar",
    }

    await expect(verifyUserSignatures(msgHex, [signature])).rejects.toThrow(
      "INVARIANT One or more signature is invalid.  Valid signatures have the following keys: addr, keyId, siganture"
    )
  })

  test("verifyUserSignatures - throws with non-existant key", async () => {
    const Alice = await getAccountAddress("Alice")
    const msgHex = "a1b2c3"

    const signature = await signUserMessage(msgHex, Alice)
    signature.keyId = 42

    await expect(verifyUserSignatures(msgHex, [signature])).rejects.toThrow(
      `INVARIANT Key index ${signature.keyId} does not exist on account ${Alice}`
    )
  })

  test("prependDomainTag prepends a domain tag to a given msgHex", () => {
    const msgHex = "a1b2c3"
    const domainTag = "hello world"
    const paddedDomainTagHex =
      "00000000000000000000000000000000000000000068656c6c6f20776f726c64"

    const result = prependDomainTag(msgHex, domainTag)
    const expected = paddedDomainTagHex + msgHex

    expect(result).toEqual(expected)
  })

  test("resolveHashAlgoKey - unsupported hash algorithm", () => {
    const hashAlgorithm = "ABC123"
    expect(() => resolveHashAlgoKey(hashAlgorithm)).toThrow(
      `Provided hash algorithm "${hashAlgorithm}" is not currently supported`
    )
  })

  test("resolveHashAlgoKey - unsupported signature algorithm", () => {
    const signatureAlgorithm = "ABC123"
    expect(() => resolveSignAlgoKey(signatureAlgorithm)).toThrow(
      `Provided signature algorithm "${signatureAlgorithm}" is not currently supported`
    )
  })
})
