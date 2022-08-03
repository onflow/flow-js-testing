import path from "path"
import {
  emulator,
  init,
  getAccountAddress,
  executeScript,
  createAccount,
  HashAlgorithm,
  SignatureAlgorithm,
} from "../src"
import {playgroundImport} from "../src/transformers"
import * as fcl from "@onflow/fcl"
import {validateKeyPair} from "./util/validate-key-pair"
import {permute} from "./util/permute"
import {isAddress} from "../src"

beforeEach(async () => {
  const basePath = path.resolve(__dirname, "./cadence")
  await init(basePath)
  return emulator.start()
})

afterEach(async () => {
  emulator.stop()
})

it("createAccount - should work with name and resolves to correct getAccountAddress", async () => {
  const addr1 = await createAccount({
    name: "Billy",
  })

  const addr2 = await getAccountAddress("Billy")

  expect(addr1).toBe(addr2)
})

it("createAccount - should work without name and returns address", async () => {
  const Billy = await createAccount({
    name: "Billy",
  })

  expect(Billy).toMatch(/^0x[0-9a-f]{16}$/)
})

test.each(permute(Object.keys(HashAlgorithm), Object.keys(SignatureAlgorithm)))(
  "createAccount - should work with custom keys - hash algorithm %s - signing algorithm %s",
  async (hashAlgorithm, signatureAlgorithm) => {
    const privateKey = "1234"
    const Billy = await createAccount({
      name: "Billy",
      keys: [
        {
          privateKey,
          hashAlgorithm: HashAlgorithm[hashAlgorithm],
          signatureAlgorithm: SignatureAlgorithm[signatureAlgorithm],
        },
      ],
    })

    expect(isAddress(Billy)).toBe(true)

    const keys = await fcl.account(Billy).then(d => d.keys)

    expect(keys.length).toBe(1)
    expect(keys[0].hashAlgoString).toBe(hashAlgorithm)
    expect(keys[0].signAlgoString).toBe(signatureAlgorithm)
    expect(keys[0].weight).toBe(1000)
    expect(
      validateKeyPair(keys[0].publicKey, privateKey, signatureAlgorithm)
    ).toBe(true)
  }
)

test("createAccount - should work with custom keys - defaults to SHA3_256, ECDSA_P256", async () => {
  const privateKey = "1234"
  const Billy = await createAccount({
    name: "Billy",
    keys: [
      {
        privateKey,
      },
    ],
  })

  expect(isAddress(Billy)).toBe(true)

  const keys = await fcl.account(Billy).then(d => d.keys)

  expect(keys.length).toBe(1)
  expect(keys[0].hashAlgoString).toBe("SHA3_256")
  expect(keys[0].signAlgoString).toBe("ECDSA_P256")
  expect(keys[0].weight).toBe(1000)
  expect(
    validateKeyPair(
      keys[0].publicKey,
      privateKey,
      SignatureAlgorithm.ECDSA_P256
    )
  ).toBe(true)
})

it("createAccount - should add universal private key to account by default", async () => {
  const Billy = await createAccount({
    name: "Billy",
  })

  expect(Billy).toMatch(/^0x[0-9a-f]{16}$/)
})

it("getAccountAddress - should return proper playground addresses", async () => {
  const accounts = ["Alice", "Bob", "Charlie", "Dave", "Eve"]
  for (const i in accounts) {
    await getAccountAddress(accounts[i])
  }

  const code = `
        pub fun main(address:Address):Address{
          return getAccount(address).address
        } 
      `

  const playgroundAddresses = ["0x01", "0x02", "0x03", "0x04", "0x05"]
  for (const i in playgroundAddresses) {
    const [result] = await executeScript({
      code,
      transformers: [playgroundImport(accounts)],
      args: [playgroundAddresses[i]],
    })
    const account = await getAccountAddress(accounts[i])
    expect(result).toBe(account)
  }
})

it("getAccountAddress - should create an account if does not exist", async () => {
  const Billy = await getAccountAddress("Billy")

  expect(Billy).toMatch(/^0x[0-9a-f]{16}$/)
})

it("getAccountAddress - should resolve an already created account", async () => {
  const Billy1 = await getAccountAddress("Billy")
  const Billy2 = await getAccountAddress("Billy")

  expect(Billy1).toMatch(/^0x[0-9a-f]{16}$/)
  expect(Billy1).toMatch(Billy2)
})
